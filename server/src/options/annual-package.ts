import {
  annualPackageQuerySchema,
  getAnnualPackageResponseSchema
} from '@invoicetrackr/types';
import { RouteShorthandOptionsWithHandler } from 'fastify';

import {
  exportAnnualPackage,
  getAnnualPackage
} from '../controllers/annual-package';
import { authMiddleware } from '../middleware/auth';

export const getAnnualPackageOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    querystring: annualPackageQuerySchema,
    response: { 200: getAnnualPackageResponseSchema }
  },
  preHandler: [authMiddleware],
  handler: getAnnualPackage
};

export const exportAnnualPackageOptions: RouteShorthandOptionsWithHandler = {
  schema: { querystring: annualPackageQuerySchema },
  preHandler: [authMiddleware],
  handler: exportAnnualPackage
};
