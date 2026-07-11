import { beforeEach, describe, expect, it } from 'vitest';

import { createTestApp } from '../../test/app';
import { mockResendForward } from '../../test/setup';
import { handleResendWebhook } from '../webhook';

describe('Webhook Controller', () => {
  describe('POST /api/webhook/resend', () => {
    beforeEach(() => {
      process.env.RESEND_FORWARD_TO_EMAIL = 'owner@example.com';
      process.env.RESEND_FORWARD_FROM_EMAIL = 'support@invoicetrackr.app';
    });

    it('forwards received emails to the configured inbox', async () => {
      const app = await createTestApp((fastifyApp) => {
        fastifyApp.post('/api/webhook/resend', handleResendWebhook);
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/webhook/resend',
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

      await app.close();
    });

    it('acknowledges unrelated Resend events without forwarding', async () => {
      const app = await createTestApp((fastifyApp) => {
        fastifyApp.post('/api/webhook/resend', handleResendWebhook);
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/webhook/resend',
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

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.post('/api/webhook/resend', handleResendWebhook);
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/webhook/resend',
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
      const app = await createTestApp((fastifyApp) => {
        fastifyApp.post('/api/webhook/resend', handleResendWebhook);
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/webhook/resend',
        payload: {
          type: 'email.received',
          data: {}
        }
      });

      expect(response.statusCode).toBe(400);
      expect(mockResendForward).not.toHaveBeenCalled();

      await app.close();
    });
  });
});
