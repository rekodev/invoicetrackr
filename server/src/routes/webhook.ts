import {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions
} from 'fastify';

import { stripeWebhookOptions } from '../options/webhook';

const webhookRoutes = (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes
) => {
  fastify.post('/api/webhook/stripe', stripeWebhookOptions);

  done();
};

export default webhookRoutes;
