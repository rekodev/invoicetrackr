import {
  dashboardSummaryQuerySchema,
  getDashboardSummaryResponseSchema
} from '@invoicetrackr/types';
import { RouteShorthandOptionsWithHandler } from 'fastify';

import { getDashboardSummary } from '../controllers/dashboard';
import { authMiddleware } from '../middleware/auth';

export const getDashboardSummaryOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    querystring: dashboardSummaryQuerySchema,
    response: {
      200: getDashboardSummaryResponseSchema
    }
  },
  preHandler: [authMiddleware],
  handler: getDashboardSummary
};
