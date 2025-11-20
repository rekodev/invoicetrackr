import { describe, expect, it, vi } from 'vitest';

import * as clientDb from '../../database/client';
import * as invoiceController from '../invoice';
import * as invoiceDb from '../../database/invoice';
import { createTestApp, mockAuthMiddleware } from '../../test/app';
import {
  invoiceFactory,
  invoiceFromDbFactory
} from '../../test/factories/invoice';
import { clientFactory } from '../../test/factories/client';

vi.mock('../../database/invoice');
vi.mock('../../database/client');
vi.mock('cloudinary');

describe('Invoice Controller', () => {
  const testUserId = 1;
  const mockInvoice = invoiceFactory.build({ id: 1 });
  const mockInvoiceForDb = invoiceFromDbFactory.build({ id: 1 });
  const mockInvoiceForDb2 = invoiceFromDbFactory.build({ id: 2 });

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
          invoiceId: 'INV-003',
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
          invoiceId: 'INV-001',
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
      vi.mocked(invoiceDb.findInvoiceById).mockResolvedValue({ id: 1 });
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
          invoiceId: 'INV-001',
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
      vi.mocked(invoiceDb.findInvoiceById).mockResolvedValue({ id: 1 });
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
        { status: 1, totalAmount: 1000 },
        { status: 2, totalAmount: 2000 }
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
});
