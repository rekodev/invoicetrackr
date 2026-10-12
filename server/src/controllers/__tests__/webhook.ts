import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import webhookRoutes from '../../routes/webhook';
import { createTestApp } from '../../test/app';
import {
  mockResendReceivingGet,
  mockResendSend,
  mockResendWebhookVerify,
  mockUpdateDeliveryStatus
} from '../../test/setup';

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

    afterEach(() => vi.unstubAllGlobals());

    it('forwards received emails with the sender as reply-to and the original attached', async () => {
      mockResendReceivingGet.mockResolvedValueOnce({
        data: {
          from: 'Client <client@example.com>',
          reply_to: null,
          subject: 'Question about my invoice',
          text: 'Hello, is SF001 paid?',
          html: '<p>Hello, is SF001 paid?</p>',
          raw: { download_url: 'https://inbound.example/raw' }
        },
        error: null
      });
      const fetchMock = vi.fn().mockResolvedValue(new Response('raw-mime'));
      vi.stubGlobal('fetch', fetchMock);
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
      expect(mockResendReceivingGet).toHaveBeenCalledWith('eml_received_123');
      expect(fetchMock).toHaveBeenCalledWith('https://inbound.example/raw');
      expect(mockResendSend).toHaveBeenCalledWith({
        from: 'support@invoicetrackr.app',
        to: 'owner@example.com',
        replyTo: ['Client <client@example.com>'],
        subject: 'Question about my invoice',
        text: 'From: Client <client@example.com>\n\nHello, is SF001 paid?',
        html: '<p><strong>From: Client &lt;client@example.com&gt;</strong></p><hr /><p>Hello, is SF001 paid?</p>',
        attachments: [
          {
            filename: 'original-message.eml',
            content: Buffer.from('raw-mime').toString('base64')
          }
        ]
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

    it('records delivery outcomes from Resend without forwarding', async () => {
      const app = await createApp();
      const send = (payload: object) =>
        app.inject({
          method: 'POST',
          url: '/api/webhook/resend',
          headers: signatureHeaders,
          payload
        });

      const delivered = await send({
        type: 'email.delivered',
        created_at: '2026-10-12T10:00:00.000Z',
        data: { email_id: 'eml_sent_123' }
      });
      const bounced = await send({
        type: 'email.bounced',
        created_at: '2026-10-12T10:05:00.000Z',
        data: { email_id: 'eml_sent_456', bounce: { type: 'Permanent' } }
      });
      const opened = await send({
        type: 'email.opened',
        data: { email_id: 'eml_sent_123' }
      });

      expect([delivered, bounced, opened].map((r) => r.statusCode)).toEqual([
        200, 200, 200
      ]);
      expect(mockUpdateDeliveryStatus.mock.calls).toEqual([
        [
          {
            providerMessageId: 'eml_sent_123',
            status: 'delivered',
            failureCode: undefined,
            occurredAt: '2026-10-12T10:00:00.000Z'
          }
        ],
        [
          {
            providerMessageId: 'eml_sent_456',
            status: 'bounced',
            failureCode: 'Permanent',
            occurredAt: '2026-10-12T10:05:00.000Z'
          }
        ]
      ]);
      expect(mockResendSend).not.toHaveBeenCalled();

      await app.close();
    });

    it('returns 500 when forwarding fails', async () => {
      mockResendReceivingGet.mockResolvedValueOnce({
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
      expect(mockResendSend).not.toHaveBeenCalled();

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
      expect(mockResendSend).not.toHaveBeenCalled();

      await app.close();
    });
  });
});
