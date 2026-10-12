import { postContactResponseSchema } from '@invoicetrackr/types';
import { RouteShorthandOptionsWithHandler } from 'fastify';
import z from 'zod/v4';

import { postContactMessage } from '../controllers/contact';
import { ipRateLimit } from '../utils/rate-limit';

export const postContactMessageOptions: RouteShorthandOptionsWithHandler = {
  config: { rateLimit: ipRateLimit(5, '1 hour') },
  schema: {
    body: z.object({
      email: z.email('validation.contact.email'),
      message: z
        .string('validation.contact.message')
        .min(1, 'validation.contact.message')
        .max(5000, 'validation.contact.message')
    }),
    response: {
      200: postContactResponseSchema
    }
  },
  handler: postContactMessage
};
