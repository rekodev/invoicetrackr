import { RouteShorthandOptionsWithHandler } from 'fastify';
import { postContactResponseSchema } from '@invoicetrackr/types';
import z from 'zod/v4';

import { postContactMessage } from '../controllers/contact';

export const postContactMessageOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: z.object({
      email: z.email('validation.contact.email'),
      message: z
        .string('validation.contact.message')
        .min(1, 'validation.contact.message')
        .max(5000, 'validation.contact.message')
    }),
    response: {
      201: postContactResponseSchema
    }
  },
  handler: postContactMessage
};
