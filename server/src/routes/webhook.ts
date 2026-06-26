import {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions
} from 'fastify';

import { resendWebhookOptions, stripeWebhookOptions } from '../options/webhook';

const webhookRoutes = (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes
) => {
  fastify.post('/api/webhook/stripe', stripeWebhookOptions);
  fastify.post('/api/webhook/resend', resendWebhookOptions);

  done();
};

export default webhookRoutes;
