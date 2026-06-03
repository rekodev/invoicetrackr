import { FastifyReply, FastifyRequest } from 'fastify';
import Stripe from 'stripe';

import { BadRequestError, NotFoundError } from '../utils/error';
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

const timestampToIso = (timestamp?: number | null) =>
  timestamp ? new Date(timestamp * 1000).toISOString() : null;

const getBaseUrl = () =>
  process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL!;

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

  if (!billing) throw new NotFoundError('User not found');

  return reply.status(200).send({ billing });
};

export const getBillingStatus = async (
  req: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) => sendBillingStatus(Number(req.params.userId), reply);

export const startTrial = async (
  req: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
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
    items: [{ price: process.env.STRIPE_EUR_PRICE! }],
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
    Body: { trial?: boolean };
  }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const expectedTrial = !!req.body?.trial;
  const billing = await getBillingStatusFromDb(userId);

  if (!billing) throw new NotFoundError('User not found');
  if (!billing.hasPaidAccess || billing.paymentSuccessPending)
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
    return_url: `${getBaseUrl()}/profile`
  });

  return reply.status(200).send({ url: session.url });
};

export const createCheckoutSession = async (
  req: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const billing = await getBillingStatusFromDb(userId);

  if (!billing) throw new NotFoundError('User not found');
  if (billing.hasPaidAccess)
    throw new BadRequestError('Subscription is already active');

  const customerId = await ensureStripeCustomer(userId);
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_EUR_PRICE!, quantity: 1 }],
    success_url: `${getBaseUrl()}/payment-success?checkout=true`,
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
