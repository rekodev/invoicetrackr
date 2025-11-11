import { FastifyReply, FastifyRequest } from 'fastify';
import { useI18n } from 'fastify-i18n';
import {
  AlreadyExistsError,
  BadRequestError,
  NotFoundError
} from '../utils/errors';
import {
  createStripeCustomerInDb,
  deleteStripeAccountFromDb,
  getStripeCustomerIdFromDb,
  getStripeCustomerSubscriptionIdFromDb,
  updateStripeSubscriptionForUserInDb
} from '../database/payment';
import { stripe } from '../config/stripe';
import { getUserCurrencyFromDb } from '../database';
import 'dotenv/config';

export const createCustomer = async (
  req: FastifyRequest<{
    Params: { userId: number };
    Body: { email: string; name: string };
  }>,
  reply: FastifyReply
) => {
  const { userId } = req.params;
  const { email, name } = req.body;
  const i18n = await useI18n(req);

  const existingCustomerId = await getStripeCustomerIdFromDb(userId);

  // Delete any existing records before creating a new one
  if (existingCustomerId) {
    try {
      await stripe.customers.del(existingCustomerId);
    } catch {
      console.log('Customer does not exist in stripe');
    }

    await deleteStripeAccountFromDb(userId);
  }

  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId
    }
  });
  const customerIdFromDb = await createStripeCustomerInDb(userId, customer.id);

  if (!customer || !customerIdFromDb)
    throw new BadRequestError(i18n.t('error.payment.unableToCreateCustomer'));

  reply.status(200).send({ customerId: customer.id });
};

export const createSubscription = async (
  req: FastifyRequest<{
    Params: { userId: number };
    Body: { customerId: string };
  }>,
  reply: FastifyReply
) => {
  const { customerId } = req.body;
  const { userId } = req.params;
  const i18n = await useI18n(req);

  const currency = await getUserCurrencyFromDb(userId);

  let priceId = '';

  if (currency === 'eur') {
    priceId = process.env.STRIPE_EUR_PRICE;
  } else {
    priceId = process.env.STRIPE_USD_PRICE;
  }

  const existingSubId = await getStripeCustomerSubscriptionIdFromDb(userId);

  if (existingSubId) {
    const existingSubscription =
      await stripe.subscriptions.retrieve(existingSubId);

    if (existingSubscription.status === 'active')
      throw new AlreadyExistsError(i18n.t('error.payment.subscriptionAlreadyActive'));
  }

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    currency,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.confirmation_secret']
  });

  const updatedSubscriptionId = await updateStripeSubscriptionForUserInDb(
    userId,
    subscription.id
  );

  if (!subscription || !updatedSubscriptionId)
    throw new BadRequestError(i18n.t('error.payment.unableToCreateSubscription'));

  reply.status(200).send({
    type: 'payment',
    clientSecret:
      typeof subscription.latest_invoice !== 'string'
        ? subscription.latest_invoice.confirmation_secret.client_secret
        : ''
  });
};

export const getStripeCustomerId = async (
  req: FastifyRequest<{ Params: { userId: number } }>,
  reply: FastifyReply
) => {
  const { userId } = req.params;
  const i18n = await useI18n(req);

  const stripeCustomerId = await getStripeCustomerIdFromDb(userId);

  if (!stripeCustomerId) throw new NotFoundError(i18n.t('error.payment.customerNotFound'));

  reply.status(200).send({ customerId: stripeCustomerId });
};

export const cancelStripeSubscription = async (
  req: FastifyRequest<{ Params: { userId: number } }>,
  reply: FastifyReply
) => {
  const { userId } = req.params;
  const i18n = await useI18n(req);

  const stripeSubscriptionId =
    await getStripeCustomerSubscriptionIdFromDb(userId);

  if (!stripeSubscriptionId) throw new NotFoundError(i18n.t('error.payment.subscriptionNotFound'));

  await stripe.subscriptions.cancel(stripeSubscriptionId);

  reply.status(200).send({ message: i18n.t('success.payment.subscriptionCanceled') });
};
