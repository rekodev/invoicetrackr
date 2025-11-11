import { Type } from '@sinclair/typebox';
import { RouteShorthandOptionsWithHandler } from 'fastify';

import {
  cancelStripeSubscription,
  createCustomer,
  createSubscription,
  getStripeCustomerId
} from '../controllers/payment';
import { MessageResponse } from '../types/responses';
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
      200: Type.Object({ customerId: Type.String() })
    }
  },
  preHandler: authMiddleware,
  handler: getStripeCustomerId
};

export const cancelStripeSubscriptionOptions: RouteShorthandOptionsWithHandler =
  {
    schema: {
      response: {
        200: MessageResponse
      }
    },
    preHandler: authMiddleware,
    handler: cancelStripeSubscription
  };
