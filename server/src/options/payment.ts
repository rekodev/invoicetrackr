import {
  cancelStripeSubscriptionResponseSchema,
  createCustomerResponseSchema,
  createSubscriptionResponseSchema,
  getStripeCustomerIdResponseSchema
} from '@invoicetrackr/types';
import { RouteShorthandOptionsWithHandler } from 'fastify';

import {
  cancelStripeSubscription,
  createCustomer,
  createSubscription,
  getStripeCustomerId
} from '../controllers/payment';
import { authMiddleware } from '../middleware/auth';

export const createCustomerOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      201: createCustomerResponseSchema
    }
  },
  preHandler: authMiddleware,
  handler: createCustomer
};

export const createSubscriptionOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      201: createSubscriptionResponseSchema
    }
  },
  preHandler: authMiddleware,
  handler: createSubscription
};

export const getStripeCustomerIdOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: getStripeCustomerIdResponseSchema
    }
  },
  preHandler: authMiddleware,
  handler: getStripeCustomerId
};

export const cancelStripeSubscriptionOptions: RouteShorthandOptionsWithHandler =
  {
    schema: {
      response: {
        200: cancelStripeSubscriptionResponseSchema
      }
    },
    preHandler: authMiddleware,
    handler: cancelStripeSubscription
  };
