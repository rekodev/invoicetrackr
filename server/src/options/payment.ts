import { RouteShorthandOptionsWithHandler } from 'fastify';
import z from 'zod/v4';

import {
  cancelStripeSubscription,
  createCustomer,
  createSubscription,
  getStripeCustomerId
} from '../controllers/payment';
import { messageResponseSchema } from '../types/response';
import { authMiddleware } from '../middleware/auth';

export const createCustomerOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: { customerId: z.string() }
    }
  },
  preHandler: authMiddleware,
  handler: createCustomer
};

export const createSubscriptionOptions: RouteShorthandOptionsWithHandler = {
  preHandler: authMiddleware,
  handler: createSubscription
};

export const getStripeCustomerIdOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: z.object({ customerId: z.string() })
    }
  },
  preHandler: authMiddleware,
  handler: getStripeCustomerId
};

export const cancelStripeSubscriptionOptions: RouteShorthandOptionsWithHandler =
  {
    schema: {
      response: {
        200: messageResponseSchema
      }
    },
    preHandler: authMiddleware,
    handler: cancelStripeSubscription
  };
