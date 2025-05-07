import { FastifyReply, FastifyRequest } from "fastify";
import "dotenv/config";
import { BadRequestError, NotFoundError } from "../utils/errors";
import Stripe from "stripe";
import {
  createStripeCustomerInDb,
  getStripeCustomerIdFromDb,
  updateStripeSubscriptionForUserInDb,
} from "../database/payment";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
  const priceId = "price_1RIYncR05Mv5dKcbHtwclkWf";

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    currency: "eur",
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
