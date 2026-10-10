import {
  getJournalResponseSchema,
  journalExportQuerySchema,
  journalQuerySchema
} from '@invoicetrackr/types';
import { RouteShorthandOptionsWithHandler } from 'fastify';

import { exportJournal, getJournal } from '../controllers/journal';
import { authMiddleware } from '../middleware/auth';

export const getJournalOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    querystring: journalQuerySchema,
    response: {
      200: getJournalResponseSchema
    }
  },
  preHandler: [authMiddleware],
  handler: getJournal
};

export const exportJournalOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    querystring: journalExportQuerySchema
  },
  preHandler: [authMiddleware],
  handler: exportJournal
};
