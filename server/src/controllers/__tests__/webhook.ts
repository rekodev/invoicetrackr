import { beforeEach, describe, expect, it } from 'vitest';

import webhookRoutes from '../../routes/webhook';
import { createTestApp } from '../../test/app';
import { mockResendForward, mockResendWebhookVerify } from '../../test/setup';

const signatureHeaders = {
  'svix-id': 'msg_123',
  'svix-timestamp': '1760000000',
  'svix-signature': 'v1,signature'
};

const createApp = () =>
  createTestApp((fastifyApp) => {
    fastifyApp.register(webhookRoutes);
  });

describe('Webhook Controller', () => {
  describe('POST /api/webhook/resend', () => {
    beforeEach(() => {
      process.env.RESEND_FORWARD_TO_EMAIL = 'owner@example.com';
      process.env.RESEND_FORWARD_FROM_EMAIL = 'support@invoicetrackr.app';
      process.env.RESEND_WEBHOOK_SECRET = 'whsec_test';
    });

    it('forwards received emails to the configured inbox', async () => {
      const app = await createApp();

      const response = await app.inject({
        method: 'POST',
        url: '/api/webhook/resend',
        headers: signatureHeaders,
        payload: {
          type: 'email.received',
          data: {
            email_id: 'eml_received_123'
          }
        }
      });

      expect(response.statusCode).toBe(200);
      expect(mockResendForward).toHaveBeenCalledWith({
        emailId: 'eml_received_123',
        to: 'owner@example.com',
        from: 'support@invoicetrackr.app'
      });
      expect(mockResendWebhookVerify).toHaveBeenCalledWith({
        payload: JSON.stringify({
          type: 'email.received',
          data: { email_id: 'eml_received_123' }
        }),
        headers: {
          id: 'msg_123',
          timestamp: '1760000000',
          signature: 'v1,signature'
        },
        webhookSecret: 'whsec_test'
      });

      await app.close();
    });

    it('acknowledges unrelated Resend events without forwarding', async () => {
      const app = await createApp();

      const response = await app.inject({
        method: 'POST',
        url: '/api/webhook/resend',
        headers: signatureHeaders,
        payload: {
          type: 'email.delivered',
          data: {
            email_id: 'eml_sent_123'
          }
        }
      });

      expect(response.statusCode).toBe(200);
      expect(mockResendForward).not.toHaveBeenCalled();

      await app.close();
    });

    it('returns 500 when forwarding fails', async () => {
      mockResendForward.mockResolvedValueOnce({
        data: null,
        error: { message: 'Forward failed' }
      });

      const app = await createApp();

      const response = await app.inject({
        method: 'POST',
        url: '/api/webhook/resend',
        headers: signatureHeaders,
        payload: {
          type: 'email.received',
          data: {
            email_id: 'eml_received_123'
          }
        }
      });

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body).message).toBe('Forward failed');

      await app.close();
    });

    it('returns 400 when a received email event is missing email_id', async () => {
      const app = await createApp();

      const response = await app.inject({
        method: 'POST',
        url: '/api/webhook/resend',
        headers: signatureHeaders,
        payload: {
          type: 'email.received',
          data: {}
        }
      });

      expect(response.statusCode).toBe(400);
      expect(mockResendForward).not.toHaveBeenCalled();

      await app.close();
    });

    it.each([
      ['unsigned', {}],
      ['incorrectly signed', signatureHeaders]
    ])('rejects %s requests without forwarding', async (_case, headers) => {
      mockResendWebhookVerify.mockImplementationOnce(() => {
        throw new Error('Invalid signature');
      });

      const app = await createApp();

      const response = await app.inject({
        method: 'POST',
        url: '/api/webhook/resend',
        headers,
        payload: {
          type: 'email.received',
          data: { email_id: 'eml_received_123' }
        }
      });

      expect(response.statusCode).toBe(401);
      expect(mockResendForward).not.toHaveBeenCalled();

      await app.close();
    });
  });
});
