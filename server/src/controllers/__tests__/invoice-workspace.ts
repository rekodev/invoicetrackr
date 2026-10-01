import { describe, expect, it, vi } from 'vitest';

import * as invoiceDb from '../../database/invoice';
import * as paymentDb from '../../database/invoice-payment';
import {
  createInvoicePaymentOptions,
  deleteInvoicePaymentOptions,
  updateInvoicePaymentOptions,
  getInvoiceWorkspaceOptions
} from '../../options/invoice-workspace';
import { createTestApp, mockAuthMiddleware } from '../../test/app';
import { invoiceFromDbFactory } from '../../test/factories/invoice';
import { mockCreateAuditEvent } from '../../test/setup';

vi.mock('../../database/invoice');
vi.mock('../../database/invoice-payment', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../database/invoice-payment')>();
  return { ...actual, changeInvoicePaymentInDb: vi.fn(), getInvoicePaymentsFromDb: vi.fn() };
});

describe('invoice workspace routes', () => {
  it('returns the saved invoice, real payments and calculated balance for its owner', async () => {
    vi.mocked(invoiceDb.getInvoiceFromDb).mockResolvedValue(
      invoiceFromDbFactory.build({
        id: 7,
        lifecycleStatus: 'issued',
        currency: 'eur',
        documentLanguage: 'lt',
        totalAmount: '100.00'
      })
    );
    vi.mocked(paymentDb.getInvoicePaymentsFromDb).mockResolvedValue([
      {
        id: 3,
        paymentDate: '2026-09-20',
        amount: '40.00',
        bankReference: null,
        notes: null,
        createdAt: '2026-09-20T10:00:00.000Z'
      }
    ]);
    const app = await createTestApp((fastifyApp) => {
      fastifyApp.get('/api/:userId/invoices/:id/workspace', {
        ...getInvoiceWorkspaceOptions,
        preHandler: mockAuthMiddleware
      });
    });
    const response = await app.inject({
      method: 'GET',
      url: '/api/2/invoices/7/workspace'
    });
    expect(response.statusCode).toBe(200);
    expect(invoiceDb.getInvoiceFromDb).toHaveBeenCalledWith(2, 7);
    expect(JSON.parse(response.body).balance.outstandingAmount).toBe('60.00');
    await app.close();
  });

  it('rejects an invalid payment amount before the database write', async () => {
    const app = await createTestApp((fastifyApp) => {
      fastifyApp.post('/api/:userId/invoices/:id/payments', {
        ...createInvoicePaymentOptions,
        preHandler: mockAuthMiddleware
      });
    });
    const response = await app.inject({
      method: 'POST',
      url: '/api/2/invoices/7/payments',
      payload: { paymentDate: '2026-09-20', amount: '0.00' }
    });
    expect(response.statusCode).toBe(400);
    expect(paymentDb.changeInvoicePaymentInDb).not.toHaveBeenCalled();
    await app.close();
  });

  it('returns a visible error when a payment exceeds the remaining balance', async () => {
    vi.mocked(paymentDb.changeInvoicePaymentInDb).mockRejectedValueOnce(
      new paymentDb.PaymentExceedsBalanceError('60.00')
    );
    const app = await createTestApp((fastifyApp) => {
      fastifyApp.post('/api/:userId/invoices/:id/payments', {
        ...createInvoicePaymentOptions,
        preHandler: mockAuthMiddleware
      });
    });
    const response = await app.inject({
      method: 'POST',
      url: '/api/2/invoices/7/payments',
      payload: { paymentDate: '2026-09-20', amount: '101.00' }
    });
    expect(response.statusCode).toBe(400);
    expect(response.json().errors).toEqual([{ key: 'amount', value: 'error.invoice.paymentMaximum' }]);
    expect(paymentDb.changeInvoicePaymentInDb).toHaveBeenCalledWith(2, 7, {
      payment: { paymentDate: '2026-09-20', amount: '101.00' }
    });
    await app.close();
  });

  it.each([
    [paymentDb.PAYMENT_NOT_FOUND, 404],
    [paymentDb.PAYMENT_INVALID_STATE, 400],
    [paymentDb.PAYMENT_FUTURE_DATE, 400],
    [paymentDb.PAYMENT_UNSUPPORTED_CURRENCY, 400]
  ])('maps payment rule %s to HTTP %s', async (code, status) => {
    vi.mocked(paymentDb.changeInvoicePaymentInDb).mockRejectedValueOnce(new Error(code));
    const app = await createTestApp((fastifyApp) => {
      fastifyApp.put('/api/:userId/invoices/:id/payments/:paymentId', {
        ...updateInvoicePaymentOptions, preHandler: mockAuthMiddleware
      });
    });
    const response = await app.inject({ method: 'PUT', url: '/api/2/invoices/7/payments/9',
      payload: { paymentDate: '2026-09-20', amount: '25.5' } });
    expect(response.statusCode).toBe(status);
    expect(paymentDb.changeInvoicePaymentInDb).toHaveBeenCalledWith(2, 7, {
      paymentId: 9, payment: { paymentDate: '2026-09-20', amount: '25.50' }
    });
    await app.close();
  });

  it('removes only the selected payment for the requested owner and invoice', async () => {
    vi.mocked(paymentDb.changeInvoicePaymentInDb).mockResolvedValueOnce({
      payment: undefined, balance: { paidAmount: '0.00', outstandingAmount: '100.00' }
    });
    const app = await createTestApp((fastifyApp) => {
      fastifyApp.delete('/api/:userId/invoices/:id/payments/:paymentId', {
        ...deleteInvoicePaymentOptions, preHandler: mockAuthMiddleware
      });
    });
    const response = await app.inject({ method: 'DELETE', url: '/api/2/invoices/7/payments/9' });
    expect(response.statusCode).toBe(200);
    expect(paymentDb.changeInvoicePaymentInDb).toHaveBeenCalledWith(2, 7, { paymentId: 9, remove: true });
    await app.close();
  });

  it('returns success when the payment was saved but its internal audit write fails', async () => {
    vi.mocked(paymentDb.changeInvoicePaymentInDb).mockResolvedValueOnce({
      payment: {
        id: 9,
        userId: 2,
        paymentDate: '2026-09-20',
        amount: '25.00',
        eurAmount: '25.00',
        currency: 'eur',
        method: 'bank_transfer',
        bankReference: null,
        notes: null,
        deletedAt: null,
        createdAt: '2026-09-20T10:00:00.000Z',
        updatedAt: '2026-09-20T10:00:00.000Z'
      },
      balance: { paidAmount: '25.00', outstandingAmount: '75.00' }
    });
    mockCreateAuditEvent.mockRejectedValueOnce(new Error('audit unavailable'));
    const app = await createTestApp((fastifyApp) => {
      fastifyApp.post('/api/:userId/invoices/:id/payments', {
        ...createInvoicePaymentOptions,
        preHandler: mockAuthMiddleware
      });
    });
    const response = await app.inject({
      method: 'POST',
      url: '/api/2/invoices/7/payments',
      payload: { paymentDate: '2026-09-20', amount: '25.00' }
    });
    expect(response.statusCode).toBe(201);
    await app.close();
  });
});
