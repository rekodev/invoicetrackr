import {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions
} from 'fastify';

import {
  createBillingPortalSessionOptions,
  createCheckoutSessionOptions,
  getBillingStatusOptions,
  resumeSubscriptionOptions,
  startTrialOptions
} from '../options/payment';

const paymentRoutes = (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes
) => {
  fastify.get('/api/:userId/billing', getBillingStatusOptions);
  fastify.post('/api/:userId/billing/start-trial', startTrialOptions);
  fastify.post(
    '/api/:userId/billing/portal-session',
    createBillingPortalSessionOptions
  );
  fastify.post(
    '/api/:userId/billing/checkout-session',
    createCheckoutSessionOptions
  );
  fastify.post('/api/:userId/billing/resume', resumeSubscriptionOptions);

  done();
};

export default paymentRoutes;
