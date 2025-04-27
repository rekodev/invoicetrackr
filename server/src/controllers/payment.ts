import { FastifyReply, FastifyRequest } from "fastify";
import "dotenv/config";
import { BadRequestError } from "../utils/errors";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (
  req: FastifyRequest<{ Body: { amount: number } }>,
  reply: FastifyReply,
) => {
  const { amount } = req.body;

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
  });

  if (!paymentIntent?.client_secret)
    throw new BadRequestError("Failed to generate client secret");

  return reply.status(200).send({ clientSecret: paymentIntent.client_secret });
};
