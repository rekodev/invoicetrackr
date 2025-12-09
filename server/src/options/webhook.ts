import { RouteShorthandOptionsWithHandler } from 'fastify';

import { authMiddleware } from '../middleware/auth';
import { handleStripeWebhook } from '../controllers/webhook';

export const stripeWebhookOptions: RouteShorthandOptionsWithHandler = {
  handler: handleStripeWebhook,
  preHandler: authMiddleware
};
