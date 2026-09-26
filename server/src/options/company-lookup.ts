import {
  companyLookupRequestSchema,
  companyLookupResponseSchema
} from '@invoicetrackr/types';
import { RouteShorthandOptionsWithHandler } from 'fastify';

import { searchCompanyLookups } from '../controllers/company-lookup';
import { authMiddleware } from '../middleware/auth';

export const searchCompanyLookupsOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: companyLookupRequestSchema,
    response: {
      200: companyLookupResponseSchema
    }
  },
  config: {
    rateLimit: {
      max: 20,
      timeWindow: '1 minute'
    }
  },
  preHandler: [authMiddleware],
  handler: searchCompanyLookups
};
