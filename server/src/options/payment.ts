import {
  billingStatusResponseSchema,
  billingUrlResponseSchema,
  consumePaymentSuccessResponseSchema
} from '@invoicetrackr/types';
import { RouteShorthandOptionsWithHandler } from 'fastify';

import {
  consumePaymentSuccess,
  createBillingPortalSession,
  createCheckoutSession,
  getBillingStatus,
  resumeSubscription,
  startTrial
} from '../controllers/payment';
import { authMiddleware } from '../middleware/auth';

export const getBillingStatusOptions: RouteShorthandOptionsWithHandler = {
  schema: { response: { 200: billingStatusResponseSchema } },
  preHandler: authMiddleware,
  handler: getBillingStatus
};

export const startTrialOptions: RouteShorthandOptionsWithHandler = {
  schema: { response: { 200: billingStatusResponseSchema } },
  preHandler: authMiddleware,
  handler: startTrial
};

export const createBillingPortalSessionOptions: RouteShorthandOptionsWithHandler =
  {
    schema: { response: { 200: billingUrlResponseSchema } },
    preHandler: authMiddleware,
    handler: createBillingPortalSession
  };

export const createCheckoutSessionOptions: RouteShorthandOptionsWithHandler = {
  schema: { response: { 200: billingUrlResponseSchema } },
  preHandler: authMiddleware,
  handler: createCheckoutSession
};

export const resumeSubscriptionOptions: RouteShorthandOptionsWithHandler = {
  schema: { response: { 200: billingStatusResponseSchema } },
  preHandler: authMiddleware,
  handler: resumeSubscription
};

export const consumePaymentSuccessOptions: RouteShorthandOptionsWithHandler = {
  schema: { response: { 200: consumePaymentSuccessResponseSchema } },
  preHandler: authMiddleware,
  handler: consumePaymentSuccess
};
