import { RouteShorthandOptionsWithHandler } from 'fastify';
import z from 'zod/v4';

import { handleResendWebhook } from '../controllers/webhook';

export const resendWebhookOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: z.object({
      type: z.string(),
      data: z
        .looseObject({
          email_id: z.string().optional()
        })
        .optional()
    }),
    response: {
      200: z.object({
        received: z.boolean(),
        data: z.unknown().optional()
      })
    }
  },
  handler: handleResendWebhook
};
