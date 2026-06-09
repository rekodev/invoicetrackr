import {
  billingIntervalRequestSchema,
  billingStatusResponseSchema,
  billingUrlResponseSchema,
  consumePaymentSuccessResponseSchema,
  merchantPaymentStatusResponseSchema
} from '@invoicetrackr/types';
import { RouteShorthandOptionsWithHandler } from 'fastify';

import {
  consumePaymentSuccess,
  createBillingPortalSession,
  createCheckoutSession,
  createMerchantPaymentOnboardingSession,
  getBillingStatus,
  getMerchantPaymentStatus,
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
  schema: {
    body: billingIntervalRequestSchema.optional(),
    response: { 200: billingStatusResponseSchema }
  },
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
  schema: {
    body: billingIntervalRequestSchema.optional(),
    response: { 200: billingUrlResponseSchema }
  },
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

export const getMerchantPaymentStatusOptions: RouteShorthandOptionsWithHandler =
  {
    schema: { response: { 200: merchantPaymentStatusResponseSchema } },
    preHandler: authMiddleware,
    handler: getMerchantPaymentStatus
  };

export const createMerchantPaymentOnboardingSessionOptions: RouteShorthandOptionsWithHandler =
  {
    schema: { response: { 200: billingUrlResponseSchema } },
    preHandler: authMiddleware,
    handler: createMerchantPaymentOnboardingSession
  };
