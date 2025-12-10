import { RouteShorthandOptionsWithHandler } from 'fastify';

import { handleStripeWebhook } from '../controllers/webhook';

export const stripeWebhookOptions: RouteShorthandOptionsWithHandler = {
  handler: handleStripeWebhook,
  config: { rawBody: true }
};
