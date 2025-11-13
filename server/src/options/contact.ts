import { RouteShorthandOptionsWithHandler } from 'fastify';
import z from 'zod/v4';

import { postContactMessage } from '../controllers/contact';
import { messageResponseSchema } from '@invoicetrackr/types';

export const postContactMessageOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: z.object({
      email: z.string().email('validation.contact.email').max(255).min(5),
      message: z.string().min(1, 'validation.contact.message').max(5000)
    }),
    response: {
      200: messageResponseSchema
    }
  },
  handler: postContactMessage
};
