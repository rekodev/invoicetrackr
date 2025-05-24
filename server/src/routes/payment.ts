import {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions,
} from "fastify";

import {
  cancelStripeSubscriptionOptions,
  createCustomerOptions,
  createSubscriptionOptions,
  getStripeCustomerIdOptions,
} from "../options/payment";

const paymentRoutes = (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes,
) => {
  fastify.post("/api/:userId/create-customer", createCustomerOptions);
  fastify.post("/api/:userId/create-subscription", createSubscriptionOptions);
  fastify.get("/api/:userId/customer", getStripeCustomerIdOptions);
  fastify.put(
    "/api/:userId/cancel-subscription",
    cancelStripeSubscriptionOptions,
  );

  done();
};

export default paymentRoutes;
