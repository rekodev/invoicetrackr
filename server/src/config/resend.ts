import { randomUUID } from 'crypto';
import { Resend } from 'resend';

import { loadEnv } from './env';

loadEnv();

const isEmailCaptureEnabled =
  process.env.EMAIL_TRANSPORT === 'capture' &&
  process.env.NODE_ENV !== 'production';

const capturingResend = {
  emails: {
    send: async () => ({
      data: { id: `captured_${randomUUID()}` },
      error: null,
      headers: null
    }),
    receiving: {
      forward: async () => ({
        data: null,
        error: { message: 'Captured email transport does not forward mail' }
      })
    }
  },
  webhooks: {
    verify: () => {
      throw new Error('Captured email transport does not receive webhooks');
    }
  }
} as unknown as Resend;

export const resend = isEmailCaptureEnabled
  ? capturingResend
  : new Resend(process.env.RESEND_EMAIL_API_KEY);
