import { RouteShorthandOptionsWithHandler } from 'fastify';
import { postContactResponseSchema } from '@invoicetrackr/types';
import z from 'zod/v4';

import { postContactMessage } from '../controllers/contact';

export const postContactMessageOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: z.object({
      email: z.string().email('validation.contact.email').max(255).min(5),
      message: z.string().min(1, 'validation.contact.message').max(5000)
    }),
    response: {
      201: postContactResponseSchema
    }
  },
  handler: postContactMessage
};
