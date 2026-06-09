import { FastifyReply, FastifyRequest } from 'fastify';
import type { BillingInterval } from '@invoicetrackr/types';
import Stripe from 'stripe';

import {
  BadRequestError,
  InternalServerError,
  NotFoundError
} from '../utils/error';
import {
  consumePaymentSuccessPendingInDb,
  getBillingStatusFromDb,
  getStripeAccountFromDb,
  updateBillingStatusInDb,
  updateStripeSubscriptionForUserInDb,
  upsertStripeAccountInDb
} from '../database/payment';
import { getUserFromDb } from '../database/user';
import { stripe } from '../config/stripe';

const TRIAL_DAYS = 7;
type BillingStatusUpdate = Parameters<typeof updateBillingStatusInDb>[1];
const LIVE_SUBSCRIPTION_STATUSES = ['active', 'trialing', 'past_due', 'paused'];

const timestampToIso = (timestamp?: number | null) =>
  timestamp ? new Date(timestamp * 1000).toISOString() : null;

const hasLiveSubscriptionStatus = (status?: string | null) =>
  !!status && LIVE_SUBSCRIPTION_STATUSES.includes(status);

const getBaseUrl = () =>
  process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL!;

const getStripePriceId = (interval: BillingInterval = 'monthly') => {
  const priceId =
    interval === 'annual'
      ? process.env.STRIPE_EUR_ANNUAL_PRICE
      : process.env.STRIPE_EUR_MONTHLY_PRICE || process.env.STRIPE_EUR_PRICE;

  if (!priceId)
    throw new InternalServerError(`Stripe ${interval} price is not configured`);

  return priceId;
};

const getSubscriptionBillingInterval = (
  subscription?: Stripe.Subscription
): BillingInterval | null => {
  const item = subscription?.items.data.at(0);
  const priceId = item?.price?.id;

  if (priceId) {
    if (priceId === process.env.STRIPE_EUR_ANNUAL_PRICE) return 'annual';
    if (
      priceId === process.env.STRIPE_EUR_MONTHLY_PRICE ||
      priceId === process.env.STRIPE_EUR_PRICE
    )
      return 'monthly';
  }

  if (item?.plan?.interval === 'year') return 'annual';
  if (item?.plan?.interval === 'month') return 'monthly';

  return null;
};

const getBillingRateFromStripePrice = (price?: Stripe.Price | null) => {
  if (!price) return undefined;

  return {
    amount: price.unit_amount,
    currency: price.currency,
    interval: price.recurring?.interval,
    intervalCount: price.recurring?.interval_count
  };
};

const getBillingRateFromStripePlan = (plan?: Stripe.Plan | null) => {
  if (!plan) return undefined;

  return {
    amount: plan.amount,
    currency: plan.currency,
    interval: plan.interval,
    intervalCount: plan.interval_count
  };
};

const getBillingRateFromStripePriceSource = async (
  price?: Stripe.Price | string | null
) => {
  if (!price) return undefined;

  if (typeof price === 'string')
    return getBillingRateFromStripePrice(await stripe.prices.retrieve(price));

  const billingRate = getBillingRateFromStripePrice(price);

  if (
    billingRate?.amount != null &&
    billingRate.currency &&
    billingRate.interval
  )
    return billingRate;

  return price.id
    ? getBillingRateFromStripePrice(await stripe.prices.retrieve(price.id))
    : billingRate;
};

const getSubscriptionBillingRate = (subscription?: Stripe.Subscription) => {
  const item = subscription?.items.data.at(0);
  const price = item?.price;
  const priceRate =
    typeof price === 'string'
      ? undefined
      : getBillingRateFromStripePrice(price);

  return hasCompleteBillingRate(priceRate)
    ? priceRate
    : getBillingRateFromStripePlan(item?.plan);
};

const getSubscriptionPriceId = (subscription?: Stripe.Subscription) => {
  const price = subscription?.items.data.at(0)?.price;

  return typeof price === 'string' ? price : price?.id;
};

const getSubscriptionBillingRateFromStripe = async (
  subscription?: Stripe.Subscription
) => {
  const currentRate = getSubscriptionBillingRate(subscription);

  if (
    currentRate?.amount != null &&
    currentRate.currency &&
    currentRate.interval
  )
    return currentRate;

  const priceId = getSubscriptionPriceId(subscription);

  if (!priceId) return currentRate;

  return getBillingRateFromStripePriceSource(priceId);
};

const getInvoiceLinePriceSource = (
  line: Stripe.InvoiceLineItem
): Stripe.Price | string | null | undefined => {
  const lineWithLegacyPrice = line as Stripe.InvoiceLineItem & {
    price?: Stripe.Price | string | null;
  };
  const lineWithPricingDetails = line as Stripe.InvoiceLineItem & {
    pricing?: {
      price_details?: {
        price?: Stripe.Price | string | null;
      } | null;
    } | null;
  };

  return (
    lineWithLegacyPrice.price ||
    lineWithPricingDetails.pricing?.price_details?.price
  );
};

const getBillingIntervalFromPeriod = (
  period?: Stripe.InvoiceLineItem.Period | null
): Stripe.Price.Recurring.Interval | undefined => {
  if (!period) return undefined;

  const days = (period.end - period.start) / 86_400;

  if (days > 330) return 'year';
  if (days > 25 && days < 35) return 'month';

  return undefined;
};

const getBillingRateFromInvoiceLine = (line: Stripe.InvoiceLineItem) => ({
  amount: line.amount,
  currency: line.currency,
  interval: getBillingIntervalFromPeriod(line.period),
  intervalCount: 1
});

const getBillingRateFromLatestInvoice = async (customerId?: string | null) => {
  if (!customerId) return undefined;

  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit: 10
  });

  for (const invoice of invoices.data) {
    for (const line of invoice.lines?.data || []) {
      const priceRate = await getBillingRateFromStripePriceSource(
        getInvoiceLinePriceSource(line)
      );
      const billingRate = hasCompleteBillingRate(priceRate)
        ? priceRate
        : getBillingRateFromInvoiceLine(line);

      if (billingRate?.amount != null && billingRate.currency)
        return billingRate;
    }
  }

  return undefined;
};

const getSubscriptionFromCheckoutSessions = async (
  customerId?: string | null
) => {
  if (!customerId) return undefined;

  const sessions = await stripe.checkout.sessions.list({
    customer: customerId,
    status: 'complete',
    limit: 10,
    expand: ['data.subscription', 'data.subscription.items.data.price']
  });

  for (const session of sessions.data) {
    const { subscription } = session;

    if (!subscription) continue;

    if (typeof subscription === 'string')
      return stripe.subscriptions.retrieve(subscription, {
        expand: ['default_payment_method', 'items.data.price']
      });

    if (
      ['active', 'trialing', 'past_due', 'paused'].includes(subscription.status)
    )
      return subscription;
  }

  return undefined;
};

const getSubscriptionByUserMetadata = async (userId: number) => {
  const subscriptions = await stripe.subscriptions.search({
    query: `metadata['userId']:'${userId}'`,
    limit: 10,
    expand: ['data.default_payment_method', 'data.items.data.price']
  });

  return subscriptions.data.find(({ status }) =>
    ['active', 'trialing', 'past_due', 'paused'].includes(status)
  );
};

const hasCompleteBillingRate = (
  billingRate: Awaited<ReturnType<typeof getBillingRateFromStripePriceSource>>
) =>
  billingRate?.amount != null &&
  !!billingRate.currency &&
  !!billingRate.interval;

const getStripeBillingDetails = async (
  account: Awaited<ReturnType<typeof getStripeAccountFromDb>>,
  subscription?: Stripe.Subscription,
  user?: Awaited<ReturnType<typeof getUserFromDb>>
) => {
  if (!account?.stripeCustomerId)
    return { hasPaymentMethod: false, billingDetails: undefined };

  const customer = await stripe.customers.retrieve(account.stripeCustomerId);

  if ('deleted' in customer && customer.deleted)
    return { hasPaymentMethod: false, billingDetails: undefined };

  const defaultPaymentMethod =
    subscription?.default_payment_method ||
    customer.invoice_settings?.default_payment_method;
  const paymentMethod =
    typeof defaultPaymentMethod === 'string'
      ? await stripe.paymentMethods.retrieve(defaultPaymentMethod)
      : defaultPaymentMethod ||
        (
          await stripe.paymentMethods.list({
            customer: account.stripeCustomerId,
            type: 'card',
            limit: 1
          })
        ).data.at(0);
  const card = paymentMethod?.card;

  return {
    hasPaymentMethod: !!paymentMethod,
    billingDetails: {
      name: customer.name || user?.name,
      email: customer.email || user?.email,
      cardBrand: card?.brand,
      cardLast4: card?.last4,
      cardExpMonth: card?.exp_month,
      cardExpYear: card?.exp_year
    }
  };
};

export const syncSubscriptionInDb = async (
  userId: number,
  subscription: Stripe.Subscription,
  { paymentSuccessPending }: { paymentSuccessPending?: boolean } = {}
) => {
  const currentPeriodEndsAt = subscription.items.data.at(0)?.current_period_end;
  const billingUpdate = {
    subscriptionStatus: subscription.status,
    trialStartedAt: timestampToIso(subscription.trial_start),
    trialEndsAt: timestampToIso(subscription.trial_end),
    subscriptionGraceEndsAt:
      subscription.status === 'past_due' ? undefined : null,
    subscriptionCurrentPeriodEndsAt: timestampToIso(currentPeriodEndsAt),
    subscriptionCancelAt: subscription.cancel_at_period_end
      ? timestampToIso(subscription.cancel_at || currentPeriodEndsAt)
      : null,
    ...(paymentSuccessPending === undefined ? {} : { paymentSuccessPending })
  };

  await updateStripeSubscriptionForUserInDb(userId, subscription.id);
  await updateBillingStatusInDb(userId, billingUpdate);
};

const ensureStripeCustomer = async (userId: number) => {
  const account = await getStripeAccountFromDb(userId);

  if (account?.stripeCustomerId) return account.stripeCustomerId;

  const user = await getUserFromDb(userId);

  if (!user) throw new NotFoundError('User not found');

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId: String(userId) }
  });

  await upsertStripeAccountInDb(userId, customer.id);

  return customer.id;
};

const sendBillingStatus = async (userId: number, reply: FastifyReply) => {
  const billing = await getBillingStatusFromDb(userId);
  const account = await getStripeAccountFromDb(userId);

  if (!billing) throw new NotFoundError('User not found');

  let subscription: Stripe.Subscription | undefined;

  if (account?.stripeSubscriptionId) {
    try {
      subscription = await stripe.subscriptions.retrieve(
        account.stripeSubscriptionId,
        { expand: ['default_payment_method', 'items.data.price'] }
      );
    } catch (error) {
      reply.log.warn({ error, userId }, 'Unable to sync Stripe subscription');
    }
  }

  if (!subscription && account?.stripeCustomerId) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: account.stripeCustomerId,
        status: 'all',
        limit: 10,
        expand: ['data.default_payment_method', 'data.items.data.price']
      });
      subscription = subscriptions.data.find(({ status }) =>
        ['active', 'trialing', 'past_due', 'paused'].includes(status)
      );
    } catch (error) {
      reply.log.warn(
        { error, userId },
        'Unable to find Stripe subscription by customer'
      );
    }
  }

  if (!subscription && account?.stripeCustomerId) {
    try {
      subscription = await getSubscriptionFromCheckoutSessions(
        account.stripeCustomerId
      );
    } catch (error) {
      reply.log.warn(
        { error, userId },
        'Unable to find Stripe subscription by checkout session'
      );
    }
  }

  if (!subscription) {
    try {
      subscription = await getSubscriptionByUserMetadata(userId);
    } catch (error) {
      reply.log.warn(
        { error, userId },
        'Unable to find Stripe subscription by user metadata'
      );
    }
  }

  if (subscription) {
    await syncSubscriptionInDb(userId, subscription);
  } else if (hasLiveSubscriptionStatus(billing.subscriptionStatus)) {
    const inactiveBillingUpdate: BillingStatusUpdate = {
      subscriptionStatus: null,
      trialEndsAt: null,
      subscriptionGraceEndsAt: null,
      subscriptionCurrentPeriodEndsAt: null,
      subscriptionCancelAt: null,
      paymentSuccessPending: false
    };

    await updateBillingStatusInDb(userId, inactiveBillingUpdate);
    await updateStripeSubscriptionForUserInDb(userId, null);
  }

  const syncedBilling = await getBillingStatusFromDb(userId);

  if (!syncedBilling) throw new NotFoundError('User not found');

  let hasPaymentMethod = false;
  const user = await getUserFromDb(userId);
  let billingRate:
    | Awaited<ReturnType<typeof getBillingRateFromStripePriceSource>>
    | undefined;
  let billingDetails:
    | {
        name?: string | null;
        email?: string | null;
        cardBrand?: string | null;
        cardLast4?: string | null;
        cardExpMonth?: number | null;
        cardExpYear?: number | null;
      }
    | undefined;

  try {
    billingRate = await getSubscriptionBillingRateFromStripe(subscription);
  } catch (error) {
    reply.log.warn({ error, userId }, 'Unable to retrieve Stripe price');
  }

  if (
    subscription &&
    !hasCompleteBillingRate(billingRate) &&
    account?.stripeCustomerId
  ) {
    try {
      billingRate = await getBillingRateFromLatestInvoice(
        account.stripeCustomerId
      );
    } catch (error) {
      reply.log.warn(
        { error, userId },
        'Unable to retrieve Stripe invoice price'
      );
    }
  }

  try {
    const stripeBillingDetails = await getStripeBillingDetails(
      account,
      subscription,
      user
    );
    hasPaymentMethod = stripeBillingDetails.hasPaymentMethod;
    billingDetails = stripeBillingDetails.billingDetails;
  } catch (error) {
    reply.log.warn({ error, userId }, 'Unable to sync Stripe billing details');
  }

  return reply.status(200).send({
    billing: {
      ...syncedBilling,
      billingInterval: getSubscriptionBillingInterval(subscription),
      billingRate,
      hasPaymentMethod,
      billingDetails
    }
  });
};

export const getBillingStatus = async (
  req: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) => sendBillingStatus(Number(req.params.userId), reply);

export const startTrial = async (
  req: FastifyRequest<{
    Params: { userId: string };
    Body: { interval?: BillingInterval };
  }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const interval = req.body?.interval || 'monthly';
  const billing = await getBillingStatusFromDb(userId);
  const account = await getStripeAccountFromDb(userId);

  if (!billing) throw new NotFoundError('User not found');
  if (!billing.onboardingCompletedAt)
    throw new BadRequestError('Complete your business profile first');
  if (
    billing.trialStartedAt ||
    billing.hasPaidAccess ||
    account?.stripeSubscriptionId
  )
    return sendBillingStatus(userId, reply);

  const customerId = await ensureStripeCustomer(userId);
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: getStripePriceId(interval) }],
    trial_period_days: TRIAL_DAYS,
    trial_settings: {
      end_behavior: { missing_payment_method: 'pause' }
    },
    metadata: { userId: String(userId) }
  });

  await upsertStripeAccountInDb(userId, customerId, subscription.id);
  await syncSubscriptionInDb(userId, subscription, {
    paymentSuccessPending: true
  });

  return sendBillingStatus(userId, reply);
};

export const consumePaymentSuccess = async (
  req: FastifyRequest<{
    Params: { userId: string };
    Body: { trial?: boolean; sessionId?: string };
  }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const expectedTrial = !!req.body?.trial;
  const checkoutSessionId = req.body?.sessionId;
  const account = await getStripeAccountFromDb(userId);
  let billing = await getBillingStatusFromDb(userId);

  if (!billing) throw new NotFoundError('User not found');
  if (!billing.paymentSuccessPending)
    return reply.status(200).send({
      canShowPaymentSuccess: false,
      billing
    });

  if (!expectedTrial) {
    if (!checkoutSessionId || !account?.stripeCustomerId)
      return reply.status(200).send({
        canShowPaymentSuccess: false,
        billing
      });

    const checkoutSession =
      await stripe.checkout.sessions.retrieve(checkoutSessionId);
    const checkoutCustomerId =
      typeof checkoutSession.customer === 'string'
        ? checkoutSession.customer
        : checkoutSession.customer?.id;

    if (
      checkoutSession.status !== 'complete' ||
      checkoutCustomerId !== account.stripeCustomerId
    )
      return reply.status(200).send({
        canShowPaymentSuccess: false,
        billing
      });

    if (checkoutSession.subscription) {
      const subscription =
        typeof checkoutSession.subscription === 'string'
          ? await stripe.subscriptions.retrieve(checkoutSession.subscription, {
              expand: ['default_payment_method', 'items.data.price']
            })
          : checkoutSession.subscription;

      await syncSubscriptionInDb(userId, subscription, {
        paymentSuccessPending: true
      });
      billing = await getBillingStatusFromDb(userId);
    }
  }

  if (!billing?.hasPaidAccess || !billing.paymentSuccessPending)
    return reply.status(200).send({
      canShowPaymentSuccess: false,
      billing
    });
  if ((billing.subscriptionStatus === 'trialing') !== expectedTrial)
    return reply.status(200).send({
      canShowPaymentSuccess: false,
      billing
    });

  const consumedBilling = await consumePaymentSuccessPendingInDb(userId);

  if (!consumedBilling) throw new NotFoundError('User not found');

  return reply.status(200).send({
    canShowPaymentSuccess: true,
    billing: consumedBilling
  });
};

export const createBillingPortalSession = async (
  req: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const customerId = await ensureStripeCustomer(userId);
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${getBaseUrl()}/profile/billing`
  });

  return reply.status(200).send({ url: session.url });
};

export const createCheckoutSession = async (
  req: FastifyRequest<{
    Params: { userId: string };
    Body: { interval?: BillingInterval };
  }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const interval = req.body?.interval || 'monthly';
  const billing = await getBillingStatusFromDb(userId);

  if (!billing) throw new NotFoundError('User not found');
  if (billing.hasPaidAccess)
    throw new BadRequestError('Subscription is already active');

  const customerId = await ensureStripeCustomer(userId);
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: getStripePriceId(interval), quantity: 1 }],
    metadata: { userId: String(userId) },
    subscription_data: {
      metadata: { userId: String(userId) }
    },
    success_url: `${getBaseUrl()}/payment-success/confirm?checkout=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getBaseUrl()}/renew-subscription`
  });
  await updateBillingStatusInDb(userId, { paymentSuccessPending: true });

  return reply.status(200).send({ url: session.url });
};

export const resumeSubscription = async (
  req: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const account = await getStripeAccountFromDb(userId);

  if (!account?.stripeSubscriptionId)
    throw new NotFoundError('Subscription not found');

  const subscription = await stripe.subscriptions.resume(
    account.stripeSubscriptionId,
    { billing_cycle_anchor: 'now' }
  );

  await syncSubscriptionInDb(userId, subscription, {
    paymentSuccessPending: true
  });

  return sendBillingStatus(userId, reply);
};
