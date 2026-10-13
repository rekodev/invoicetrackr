import { FastifyRequest } from 'fastify';

import { loadEnv } from '../config/env';
import { resend } from '../config/resend';
import { UnauthorizedError } from '../utils/error';

loadEnv();

declare module 'fastify' {
  interface FastifyRequest {
    rawBody?: string;
  }
}

export const verifyResendWebhook = async (req: FastifyRequest) => {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  const id = req.headers['svix-id'];
  const timestamp = req.headers['svix-timestamp'];
  const signature = req.headers['svix-signature'];

  if (
    !webhookSecret ||
    !req.rawBody ||
    typeof id !== 'string' ||
    typeof timestamp !== 'string' ||
    typeof signature !== 'string'
  ) {
    throw new UnauthorizedError();
  }

  try {
    resend.webhooks.verify({
      payload: req.rawBody,
      headers: { id, timestamp, signature },
      webhookSecret
    });
  } catch {
    throw new UnauthorizedError();
  }
};
