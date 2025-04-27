import {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions,
} from "fastify";

import { createPaymentIntentOptions } from "../options/payment";

const paymentRoutes = (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes,
) => {
  fastify.post("/api/create-payment-intent", createPaymentIntentOptions);

  done();
};

export default paymentRoutes;
