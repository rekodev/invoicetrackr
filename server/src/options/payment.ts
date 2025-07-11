import { Type } from '@sinclair/typebox';
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
      200: { customerId: Type.String() }
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
      200: { customerId: Type.String() }
    }
  },
  preHandler: authMiddleware,
  handler: getStripeCustomerId
};

export const cancelStripeSubscriptionOptions: RouteShorthandOptionsWithHandler =
  {
    schema: {
      response: {
        200: { message: Type.String() }
      }
    },
    preHandler: authMiddleware,
    handler: cancelStripeSubscription
  };
