import {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions,
} from "fastify";

import {
  createCustomerOptions,
  createSubscriptionOptions,
} from "../options/payment";

const paymentRoutes = (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes,
) => {
  fastify.post("/api/create-customer", createCustomerOptions);
  fastify.post("/api/create-subscription", createSubscriptionOptions);

  done();
};

export default paymentRoutes;
