import {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions
} from 'fastify';

import {
  consumePaymentSuccessOptions,
  createBillingPortalSessionOptions,
  createCheckoutSessionOptions,
  createMerchantPaymentOnboardingSessionOptions,
  getBillingStatusOptions,
  getMerchantPaymentStatusOptions,
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
  fastify.post(
    '/api/:userId/billing/consume-payment-success',
    consumePaymentSuccessOptions
  );
  fastify.get(
    '/api/:userId/merchant-payments/stripe-connect',
    getMerchantPaymentStatusOptions
  );
  fastify.post(
    '/api/:userId/merchant-payments/stripe-connect/onboarding-session',
    createMerchantPaymentOnboardingSessionOptions
  );

  done();
};

export default paymentRoutes;
