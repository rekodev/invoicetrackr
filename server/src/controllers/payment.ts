import { FastifyReply, FastifyRequest } from "fastify";
import "dotenv/config";
import { BadRequestError } from "../utils/errors";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCustomer = async (
  req: FastifyRequest<{ Body: { email: string; name: string } }>,
  reply: FastifyReply,
) => {
  const { email, name } = req.body;

  const customer = await stripe.customers.create({
    email,
    name,
  });

  if (!customer) throw new BadRequestError("Unable to create customer");

  reply.status(200).send({ customerId: customer.id });
};

export const createSubscription = async (
  req: FastifyRequest<{ Body: { customerId: string } }>,
  reply: FastifyReply,
) => {
  const { customerId } = req.body;
  const priceId = "price_1RIYncR05Mv5dKcbHtwclkWf";

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    currency: "eur",
    items: [{ price: priceId }],
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.confirmation_secret"],
  });

  if (!subscription) throw new BadRequestError("Unable to create subscription");

  reply.status(200).send({
    type: "payment",
    clientSecret:
      typeof subscription.latest_invoice !== "string"
        ? subscription.latest_invoice.confirmation_secret.client_secret
        : "",
  });
};
