import { FastifyReply, FastifyRequest } from "fastify";
import {
  AlreadyExistsError,
  BadRequestError,
  NotFoundError,
} from "../utils/errors";
import {
  createStripeCustomerInDb,
  getStripeCustomerIdFromDb,
  getStripeCustomerSubscriptionIdFromDb,
  updateStripeSubscriptionForUserInDb,
} from "../database/payment";
import { stripe } from "../config/stripe";
import { getUserCurrencyFromDb } from "../database";
import "dotenv/config";

export const createCustomer = async (
  req: FastifyRequest<{
    Params: { userId: number };
    Body: { email: string; name: string };
  }>,
  reply: FastifyReply,
) => {
  const { userId } = req.params;
  const { email, name } = req.body;

  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
    },
  });
  const customerIdFromDb = await createStripeCustomerInDb(userId, customer.id);

  if (!customer || !customerIdFromDb)
    throw new BadRequestError("Unable to create customer");

  reply.status(200).send({ customerId: customer.id });
};

export const createSubscription = async (
  req: FastifyRequest<{
    Params: { userId: number };
    Body: { customerId: string };
  }>,
  reply: FastifyReply,
) => {
  const { customerId } = req.body;
  const { userId } = req.params;

  const currency = await getUserCurrencyFromDb(userId);

  let priceId = "";

  if (currency === "eur") {
    priceId = process.env.STRIPE_EUR_PRICE;
  } else {
    priceId = process.env.STRIPE_USD_PRICE;
  }

  const existingSubId = await getStripeCustomerSubscriptionIdFromDb(userId);

  if (existingSubId) {
    const existingSubscription =
      await stripe.subscriptions.retrieve(existingSubId);

    if (existingSubscription.status === "active")
      throw new AlreadyExistsError("Subscription already active");
  }

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    currency,
    items: [{ price: priceId }],
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.confirmation_secret"],
  });

  const updatedSubscriptionId = await updateStripeSubscriptionForUserInDb(
    userId,
    subscription.id,
  );

  if (!subscription || !updatedSubscriptionId)
    throw new BadRequestError("Unable to create subscription");

  reply.status(200).send({
    type: "payment",
    clientSecret:
      typeof subscription.latest_invoice !== "string"
        ? subscription.latest_invoice.confirmation_secret.client_secret
        : "",
  });
};

export const getStripeCustomerId = async (
  req: FastifyRequest<{ Params: { userId: number } }>,
  reply: FastifyReply,
) => {
  const { userId } = req.params;

  const stripeCustomerId = await getStripeCustomerIdFromDb(userId);

  if (!stripeCustomerId) throw new NotFoundError("Customer not found.");

  reply.status(200).send({ customerId: stripeCustomerId });
};

export const cancelStripeSubscription = async (
  req: FastifyRequest<{ Params: { userId: number } }>,
  reply: FastifyReply,
) => {
  const { userId } = req.params;

  const stripeSubscriptionId =
    await getStripeCustomerSubscriptionIdFromDb(userId);

  if (!stripeSubscriptionId) throw NotFoundError("Subscription not found.");

  await stripe.subscriptions.cancel(stripeSubscriptionId);

  reply.status(200).send({ message: "Subscription canceled successfuly" });
};
