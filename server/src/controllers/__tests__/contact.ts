import { describe, expect, it, vi } from 'vitest';

import * as contactController from '../contact';
import { createTestApp } from '../../test/app';
import { resend } from '../../config/resend';

vi.mock('../../config/resend');

describe('Contact Controller', () => {
  describe('POST /api/contact', () => {
    it('should send contact message successfully', async () => {
      vi.mocked(resend.emails.send).mockResolvedValue({
        data: { id: 'test-email-id' },
        headers: null,
        error: null
      });

      const { postContactMessage } = contactController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.post('/api/contact', postContactMessage);
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/contact',
        payload: {
          email: 'test@example.com',
          message: 'Test message'
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toBeDefined();
      expect(resend.emails.send).toHaveBeenCalledWith({
        from: 'InvoiceTrackr <noreply@invoicetrackr.app>',
        to: 'support@ruwhia8088.resend.app',
        subject: 'New Contact Message',
        react: expect.anything()
      });

      await app.close();
    });

    it('should return 400 when email sending fails', async () => {
      vi.mocked(resend.emails.send).mockResolvedValue({
        data: null,
        headers: null,
        error: {
          message: 'Failed to send email',
          statusCode: 400,
          name: 'missing_required_field'
        }
      });

      const { postContactMessage } = contactController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.post('/api/contact', postContactMessage);
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/contact',
        payload: {
          email: 'test@example.com',
          message: 'Test message'
        }
      });

      expect(response.statusCode).toBe(400);

      await app.close();
    });
  });
});
