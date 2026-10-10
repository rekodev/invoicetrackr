import {
  getTaxEstimateResponseSchema,
  saveTaxProfileResponseSchema,
  taxEstimateQuerySchema,
  taxProfileBodySchema,
  taxProfileParamsSchema
} from '@invoicetrackr/types';
import { RouteShorthandOptionsWithHandler } from 'fastify';

import { getTaxEstimate, saveTaxProfile } from '../controllers/tax';
import { authMiddleware } from '../middleware/auth';

export const getTaxEstimateOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    querystring: taxEstimateQuerySchema,
    response: { 200: getTaxEstimateResponseSchema }
  },
  preHandler: [authMiddleware],
  handler: getTaxEstimate
};

export const saveTaxProfileOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    params: taxProfileParamsSchema,
    body: taxProfileBodySchema,
    response: { 200: saveTaxProfileResponseSchema }
  },
  preHandler: [authMiddleware],
  handler: saveTaxProfile
};
