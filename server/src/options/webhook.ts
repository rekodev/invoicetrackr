import { RouteShorthandOptionsWithHandler } from 'fastify';
import z from 'zod/v4';

import { handleResendWebhook } from '../controllers/webhook';
import { verifyResendWebhook } from '../middleware/webhook';

export const resendWebhookOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: z.object({
      type: z.string(),
      created_at: z.string().optional(),
      data: z
        .looseObject({
          email_id: z.string().optional(),
          bounce: z.looseObject({ type: z.string().optional() }).optional()
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
  preHandler: verifyResendWebhook,
  handler: handleResendWebhook
};
