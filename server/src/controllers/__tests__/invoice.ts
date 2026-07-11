import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_CURRENCY } from '@invoicetrackr/types';

import * as clientDb from '../../database/client';
import * as invoiceController from '../invoice';
import * as invoiceDb from '../../database/invoice';
import * as userDb from '../../database/user';
import { createTestApp, mockAuthMiddleware } from '../../test/app';
import {
  invoiceFactory,
  invoiceFromDbFactory
} from '../../test/factories/invoice';
import { mockResendSend, mockUseI18n } from '../../test/setup';
import { clientFactory } from '../../test/factories/client';
import en from '../../locales/en';
import lt from '../../locales/lt';
import { userFactory } from '../../test/factories/user';

vi.mock('../../database/invoice');
vi.mock('../../database/client');
vi.mock('../../database/user');
vi.mock('cloudinary');

describe('Invoice Controller', () => {
  const testUserId = 1;
  const mockInvoice = invoiceFactory.build({ id: 1 });
  const mockInvoiceForDb = invoiceFromDbFactory.build({ id: 1 });
  const mockInvoiceForDb2 = invoiceFromDbFactory.build({ id: 2 });

  beforeEach(() => {
    mockUseI18n.mockImplementation(async (request) => {
      const locale = request?.headers['accept-language'] === 'lt' ? lt : en;

      return {
        t: (key: string, options?: Record<string, string>) => {
          const value = key
            .split('.')
            .reduce<unknown>(
              (result, segment) =>
                typeof result === 'object' && result !== null
                  ? (result as Record<string, unknown>)[segment]
                  : undefined,
              locale
            );

          if (typeof value !== 'string') return key;

          return Object.entries(options || {}).reduce(
            (translation, [name, replacement]) =>
              translation.replace(`%{${name}}`, replacement),
            value
          );
        }
      } as never;
    });
  });

  describe('GET /api/:userId/invoices', () => {
    it('should return all invoices for a user', async () => {
      vi.mocked(invoiceDb.getInvoicesFromDb).mockResolvedValue([
        mockInvoiceForDb,
        mockInvoiceForDb2
      ]);

      const { getInvoices } = invoiceController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.get(
          '/api/:userId/invoices',
          {
            preHandler: mockAuthMiddleware
          },
          getInvoices
        );
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/${testUserId}/invoices`
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.invoices).toBeDefined();
      expect(Array.isArray(body.invoices)).toBe(true);
      expect(body.invoices.length).toBe(2);
      expect(invoiceDb.getInvoicesFromDb).toHaveBeenCalledWith(testUserId);

      await app.close();
    });
  });

  describe('GET /api/:userId/invoices/income-journal.csv', () => {
    it('should export paid income journal rows as CSV', async () => {
      vi.mocked(invoiceDb.getIncomeJournalRowsFromDb).mockResolvedValue([
        {
          paidAt: '2026-05-20T10:00:00.000Z',
          date: '2026-05-15',
          invoiceId: 'SF001',
          receiverName: 'Test Client',
          receiverBusinessNumber: '123456789',
          descriptions: 'Consulting, implementation',
          subtotalAmount: '100.00',
          vatAmount: '21.00',
          totalAmount: '121.00',
          currency: DEFAULT_CURRENCY
        }
      ]);

      const { getIncomeJournal } = invoiceController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.get(
          '/api/:userId/invoices/income-journal.csv',
          {
            preHandler: mockAuthMiddleware
          },
          getIncomeJournal
        );
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/${testUserId}/invoices/income-journal.csv?from=2026-05-01&to=2026-05-31`,
        headers: { 'accept-language': 'en' }
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toBe(
        'attachment; filename="income-journal-2026-05-01-2026-05-31.csv"'
      );
      expect(response.body).toContain('\uFEFF"Payment date"');
      expect(response.body).toContain('"Consulting, implementation"');
      expect(invoiceDb.getIncomeJournalRowsFromDb).toHaveBeenCalledWith({
        userId: testUserId,
        from: '2026-05-01',
        to: '2026-05-31'
      });

      await app.close();
    });

    it('should export Lithuanian headers and filename for Lithuanian users', async () => {
      vi.mocked(invoiceDb.getIncomeJournalRowsFromDb).mockResolvedValue([]);

      const { getIncomeJournal } = invoiceController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.get(
          '/api/:userId/invoices/income-journal.csv',
          {
            preHandler: mockAuthMiddleware
          },
          getIncomeJournal
        );
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/${testUserId}/invoices/income-journal.csv?from=2026-05-01&to=2026-05-31`,
        headers: { 'accept-language': 'lt' }
      });

      expect(response.headers['content-disposition']).toBe(
        'attachment; filename="pajamu-zurnalas-2026-05-01-2026-05-31.csv"'
      );
      expect(response.body).toContain('\uFEFF"Apmokėjimo data"');

      await app.close();
    });
  });

  describe('GET /api/:userId/invoices/:id', () => {
    it('should return a specific invoice', async () => {
      vi.mocked(invoiceDb.getInvoiceFromDb).mockResolvedValue(mockInvoiceForDb);

      const { getInvoice } = invoiceController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.get(
          '/api/:userId/invoices/:id',
          {
            preHandler: mockAuthMiddleware
          },
          getInvoice
        );
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/${testUserId}/invoices/${mockInvoice.id}`
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.invoice).toBeDefined();
      expect(body.invoice.id).toBe(mockInvoice.id);
      expect(invoiceDb.getInvoiceFromDb).toHaveBeenCalledWith(
        testUserId,
        mockInvoice.id
      );

      await app.close();
    });

    it('should return 404 when invoice not found', async () => {
      vi.mocked(invoiceDb.getInvoiceFromDb).mockResolvedValue(undefined);

      const { getInvoice } = invoiceController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.get(
          '/api/:userId/invoices/:id',
          {
            preHandler: mockAuthMiddleware
          },
          getInvoice
        );
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/${testUserId}/invoices/999`
      });

      expect(response.statusCode).toBe(404);

      await app.close();
    });
  });

  describe('POST /api/:userId/invoices', () => {
    it('should create a new invoice', async () => {
      vi.mocked(invoiceDb.findInvoiceByInvoiceId).mockResolvedValue(undefined);
      vi.mocked(invoiceDb.insertInvoiceInDb).mockResolvedValue(
        mockInvoiceForDb
      );

      const { postInvoice } = invoiceController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.post(
          '/api/:userId/invoices',
          {
            preHandler: mockAuthMiddleware
          },
          postInvoice
        );
      });

      const response = await app.inject({
        method: 'POST',
        url: `/api/${testUserId}/invoices`,
        payload: {
          invoiceId: 'INV003',
          clientId: 1,
          invoiceDate: '2024-01-01',
          dueDate: '2024-02-01',
          items: [],
          status: 'pending',
          totalAmount: 1500,
          senderName: 'Test Sender',
          senderEmail: 'sender@example.com',
          senderAddress: '123 Sender St',
          receiverName: 'Test Receiver',
          receiverEmail: 'receiver@example.com',
          receiverAddress: '456 Receiver St'
        }
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.invoice).toBeDefined();
      expect(body.message).toBeDefined();

      await app.close();
    });

    it('should return 403 when invoice already exists', async () => {
      vi.mocked(invoiceDb.findInvoiceByInvoiceId).mockResolvedValue({ id: 1 });

      const { postInvoice } = invoiceController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.post(
          '/api/:userId/invoices',
          {
            preHandler: mockAuthMiddleware
          },
          postInvoice
        );
      });

      const response = await app.inject({
        method: 'POST',
        url: `/api/${testUserId}/invoices`,
        payload: {
          invoiceId: 'INV001',
          clientId: 1,
          invoiceDate: '2024-01-01',
          dueDate: '2024-02-01',
          items: []
        }
      });

      expect(response.statusCode).toBe(403);

      await app.close();
    });
  });

  describe('PUT /api/:userId/invoices/:id', () => {
    it('should update an existing invoice', async () => {
      vi.mocked(invoiceDb.getInvoiceFromDb).mockResolvedValue(mockInvoiceForDb);
      const updatedInvoice = { ...mockInvoiceForDb, totalAmount: '1500' };
      vi.mocked(invoiceDb.updateInvoiceInDb).mockResolvedValue(updatedInvoice);

      const { updateInvoice } = invoiceController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.put(
          '/api/:userId/invoices/:id',
          {
            preHandler: mockAuthMiddleware
          },
          updateInvoice
        );
      });

      const response = await app.inject({
        method: 'PUT',
        url: `/api/${testUserId}/invoices/${mockInvoice.id}`,
        payload: {
          id: mockInvoice.id,
          invoiceId: 'INV001',
          totalAmount: 1500
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.invoice).toBeDefined();
      expect(body.message).toBeDefined();

      await app.close();
    });
  });

  describe('PUT /api/:userId/invoices/:id/status', () => {
    it('should update invoice status', async () => {
      vi.mocked(invoiceDb.getInvoiceFromDb).mockResolvedValue(mockInvoiceForDb);
      vi.mocked(invoiceDb.updateInvoiceStatusInDb).mockResolvedValue({
        id: 1
      });

      const { updateInvoiceStatus } = invoiceController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.put(
          '/api/:userId/invoices/:id/status',
          {
            preHandler: mockAuthMiddleware
          },
          updateInvoiceStatus
        );
      });

      const response = await app.inject({
        method: 'PUT',
        url: `/api/${testUserId}/invoices/${mockInvoice.id}/status`,
        payload: {
          status: 'paid'
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toBeDefined();

      await app.close();
    });

  });

  describe('DELETE /api/:userId/invoices/:id', () => {
    it('should delete an invoice', async () => {
      vi.mocked(invoiceDb.getInvoiceFromDb).mockResolvedValue(mockInvoiceForDb);
      vi.mocked(invoiceDb.deleteInvoiceFromDb).mockResolvedValue({ id: 1 });

      const { deleteInvoice } = invoiceController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.delete(
          '/api/:userId/invoices/:id',
          {
            preHandler: mockAuthMiddleware
          },
          deleteInvoice
        );
      });

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/${testUserId}/invoices/${mockInvoice.id}`
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toBeDefined();

      await app.close();
    });
  });

  describe('GET /api/:userId/invoices/total-amount', () => {
    it('should return total amount and client data', async () => {
      const mockInvoiceTotals = [
        { status: 1, subtotalAmount: 1000, vatAmount: 0, totalAmount: 1000 },
        { status: 2, subtotalAmount: 2000, vatAmount: 0, totalAmount: 2000 }
      ];
      const mockClient = clientFactory.build();

      vi.mocked(invoiceDb.getInvoicesTotalAmountFromDb).mockResolvedValue(
        mockInvoiceTotals
      );
      vi.mocked(clientDb.getClientsFromDb).mockResolvedValue([mockClient]);

      const { getInvoicesTotalAmount } = invoiceController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.get(
          '/api/:userId/invoices/total-amount',
          {
            preHandler: mockAuthMiddleware
          },
          getInvoicesTotalAmount
        );
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/${testUserId}/invoices/total-amount`
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toBeDefined();

      await app.close();
    });
  });

  describe('GET /api/invoices/sign/:token', () => {
    it('should reject an expired signing link', async () => {
      vi.mocked(invoiceDb.getPublicInvoiceSigningFromDb).mockResolvedValue({
        invoice: invoiceFromDbFactory.build({
          recipientSigningExpiresAt: new Date(Date.now() - 1000).toISOString()
        }),
        userId: testUserId,
        currency: 'EUR',
        language: 'en',
        preferredInvoiceLanguage: null
      });

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.get(
          '/api/invoices/sign/:token',
          invoiceController.getPublicInvoiceSigning
        );
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/invoices/sign/expired-token'
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).message).toBe(
        'This invoice link has expired. Ask the sender for a fresh link.'
      );

      await app.close();
    });

    it('should reject a revoked signing link', async () => {
      vi.mocked(invoiceDb.getPublicInvoiceSigningFromDb).mockResolvedValue({
        invoice: invoiceFromDbFactory.build({
          recipientSigningRevokedAt: new Date().toISOString()
        }),
        userId: testUserId,
        currency: 'EUR',
        language: 'en',
        preferredInvoiceLanguage: null
      });

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.get(
          '/api/invoices/sign/:token',
          invoiceController.getPublicInvoiceSigning
        );
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/invoices/sign/revoked-token'
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).message).toBe(
        'This invoice link has been revoked. Ask the sender for a fresh link.'
      );

      await app.close();
    });
  });

  describe('POST /api/:userId/invoices/:id/send-email', () => {
    it('regenerates a revoked public link before resending invoice email', async () => {
      vi.mocked(invoiceDb.getInvoiceFromDb).mockResolvedValue(
        invoiceFromDbFactory.build({
          id: 1,
          publicInvoiceToken: 'old-token',
          publicInvoiceRevokedAt: new Date().toISOString()
        })
      );
      vi.mocked(userDb.getUserFromDb).mockResolvedValue(
        userFactory.build({
          id: testUserId,
          email: 'sender@example.com',
          currency: DEFAULT_CURRENCY
        })
      );
      vi.mocked(invoiceDb.regeneratePublicInvoiceFromDb).mockResolvedValue({
        id: 1,
        publicInvoiceToken: 'fresh-token',
        publicInvoiceExpiresAt: new Date(Date.now() + 1000).toISOString()
      });
      vi.mocked(invoiceDb.markPublicInvoiceSentInDb).mockResolvedValue({
        id: 1
      });

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.post(
          '/api/:userId/invoices/:id/send-email',
          {
            preHandler: mockAuthMiddleware
          },
          invoiceController.sendInvoiceEmail
        );
      });

      const response = await app.inject({
        method: 'POST',
        url: `/api/${testUserId}/invoices/1/send-email`,
        payload: {
          recipientEmail: 'receiver@example.com',
          subject: 'Invoice INV001',
          includePublicLink: true,
          requestSignature: false
        }
      });

      expect(response.statusCode).toBe(200);
      expect(invoiceDb.regeneratePublicInvoiceFromDb).toHaveBeenCalledWith({
        userId: testUserId,
        id: 1,
        token: expect.any(String),
        expiresAt: expect.any(String)
      });
      expect(invoiceDb.preparePublicInvoiceFromDb).not.toHaveBeenCalled();
      expect(invoiceDb.markPublicInvoiceSentInDb).toHaveBeenCalledWith({
        userId: testUserId,
        id: 1,
        requestSignature: false
      });
      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'receiver@example.com',
          replyTo: 'sender@example.com',
          subject: 'Invoice INV001'
        })
      );

      await app.close();
    });
  });

  describe('GET /api/invoices/public/:token', () => {
    it('rejects an expired public invoice link', async () => {
      vi.mocked(invoiceDb.getPublicInvoiceFromDb).mockResolvedValue({
        invoice: invoiceFromDbFactory.build({
          publicInvoiceToken: 'public-token',
          publicInvoiceExpiresAt: new Date(Date.now() - 1000).toISOString()
        }),
        userId: testUserId,
        currency: 'EUR',
        language: 'en',
        preferredInvoiceLanguage: null
      });

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.get(
          '/api/invoices/public/:token',
          invoiceController.getPublicInvoice
        );
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/invoices/public/public-token'
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).message).toBe(
        'This invoice link has expired. Ask the sender for a fresh link.'
      );

      await app.close();
    });

    it('rejects a revoked public invoice link', async () => {
      vi.mocked(invoiceDb.getPublicInvoiceFromDb).mockResolvedValue({
        invoice: invoiceFromDbFactory.build({
          publicInvoiceToken: 'public-token',
          publicInvoiceExpiresAt: new Date(Date.now() + 1000).toISOString(),
          publicInvoiceRevokedAt: new Date().toISOString()
        }),
        userId: testUserId,
        currency: 'EUR',
        language: 'en',
        preferredInvoiceLanguage: null
      });

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.get(
          '/api/invoices/public/:token',
          invoiceController.getPublicInvoice
        );
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/invoices/public/public-token'
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).message).toBe(
        'This invoice link has been revoked. Ask the sender for a fresh link.'
      );

      await app.close();
    });

    it('returns public invoice with bank-transfer payment details', async () => {
      const invoice = invoiceFromDbFactory.build({
        publicInvoiceToken: 'public-token',
        publicInvoiceExpiresAt: new Date(Date.now() + 1000).toISOString(),
        recipientSigningRequestedAt: null,
        recipientSigningToken: null
      });

      vi.mocked(invoiceDb.getPublicInvoiceFromDb).mockResolvedValue({
        invoice,
        userId: testUserId,
        currency: 'EUR',
        language: 'en',
        preferredInvoiceLanguage: null
      });

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.get(
          '/api/invoices/public/:token',
          invoiceController.getPublicInvoice
        );
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/invoices/public/public-token'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.publicInvoice.payment.available).toBe(false);
      expect(body.publicInvoice.payment.configuredMode).toBe('manual');
      expect(body.publicInvoice.payment.resolvedMode).toBe('manual');
      expect(body.publicInvoice.payment.manualReference).toBe(
        invoice.invoiceId
      );
      expect(body.publicInvoice.signing.requested).toBe(false);

      await app.close();
    });

    it('returns disabled payment state when invoice payment is disabled', async () => {
      vi.mocked(invoiceDb.getPublicInvoiceFromDb).mockResolvedValue({
        invoice: invoiceFromDbFactory.build({
          publicInvoiceToken: 'public-token',
          publicInvoiceExpiresAt: new Date(Date.now() + 1000).toISOString(),
          paymentMode: 'disabled'
        }),
        userId: testUserId,
        currency: 'EUR',
        language: 'en',
        preferredInvoiceLanguage: null
      });

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.get(
          '/api/invoices/public/:token',
          invoiceController.getPublicInvoice
        );
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/invoices/public/public-token'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.publicInvoice.payment.available).toBe(false);
      expect(body.publicInvoice.payment.configuredMode).toBe('disabled');
      expect(body.publicInvoice.payment.resolvedMode).toBe('disabled');

      await app.close();
    });
  });

  describe('POST /api/:userId/invoices/:id/public-link/revoke', () => {
    it('revokes an existing public invoice link', async () => {
      vi.mocked(invoiceDb.getInvoiceFromDb).mockResolvedValue(
        invoiceFromDbFactory.build({
          id: 1,
          lifecycleStatus: 'issued',
          publicInvoiceToken: 'public-token'
        })
      );
      vi.mocked(invoiceDb.revokePublicInvoiceFromDb).mockResolvedValue({
        id: 1
      });

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.post(
          '/api/:userId/invoices/:id/public-link/revoke',
          {
            preHandler: mockAuthMiddleware
          },
          invoiceController.revokePublicInvoice
        );
      });

      const response = await app.inject({
        method: 'POST',
        url: `/api/${testUserId}/invoices/1/public-link/revoke`
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).message).toBe(
        'Public invoice link revoked'
      );
      expect(invoiceDb.revokePublicInvoiceFromDb).toHaveBeenCalledWith({
        userId: testUserId,
        id: 1
      });

      await app.close();
    });
  });

  describe('POST /api/:userId/invoices/:id/public-link/regenerate', () => {
    it('generates a fresh public invoice link and clears old state', async () => {
      vi.mocked(invoiceDb.getInvoiceFromDb).mockResolvedValue(
        invoiceFromDbFactory.build({
          id: 1,
          lifecycleStatus: 'issued',
          publicInvoiceToken: 'old-token',
          publicInvoiceRevokedAt: new Date().toISOString()
        })
      );
      vi.mocked(invoiceDb.regeneratePublicInvoiceFromDb).mockResolvedValue({
        id: 1,
        publicInvoiceToken: 'fresh-token',
        publicInvoiceExpiresAt: new Date(Date.now() + 1000).toISOString()
      });

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.post(
          '/api/:userId/invoices/:id/public-link/regenerate',
          {
            preHandler: mockAuthMiddleware
          },
          invoiceController.regeneratePublicInvoice
        );
      });

      const response = await app.inject({
        method: 'POST',
        url: `/api/${testUserId}/invoices/1/public-link/regenerate`
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({
        publicInvoiceToken: 'fresh-token',
        publicInvoiceExpiresAt: expect.any(String),
        message: 'Fresh public invoice link generated'
      });
      expect(invoiceDb.regeneratePublicInvoiceFromDb).toHaveBeenCalledWith({
        userId: testUserId,
        id: 1,
        token: expect.any(String),
        expiresAt: expect.any(String)
      });

      await app.close();
    });
  });

});
