import type { InvoiceEmailContent } from '@invoicetrackr/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { reserveInvoiceEmailAttemptInDb } from '../invoice-email';

const { results, mockSelect, mockInsert, mockUpdate, mockLock } = vi.hoisted(() => ({
  results: [] as Array<Array<Record<string, unknown>>>,
  mockSelect: vi.fn(), mockInsert: vi.fn(), mockUpdate: vi.fn(), mockLock: vi.fn()
}));
vi.mock('../db', () => ({ db: { transaction: (work: (tx: unknown) => Promise<unknown>) =>
  work({ select: mockSelect, insert: mockInsert, update: mockUpdate }) } }));
const content: InvoiceEmailContent = { recipientEmail: 'client@example.com', subject: 'Invoice',
  message: '', language: 'lt', kind: 'invoice', includePublicLink: true, requestSignature: false };
const invoice = { id: 7, userId: 2, lifecycleStatus: 'issued', status: 'pending', totalAmount: '100.00' };
const existing = { id: 9, userId: 2, invoiceId: 7, content, status: 'unknown',
  providerStartedAt: '2026-09-26T09:00:00Z', recoveryExpiresAt: '2026-09-27T08:55:00Z',
  leaseUntil: null, failureCode: null };
const request = { userId: 2, invoiceId: 7, attemptKey: '5138c5b6-3792-424f-8a25-ca47bd0c2d76', content };

describe('invoice email reservations', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-26T10:00:00Z'));
    results.length = 0;
    mockSelect.mockImplementation(() => {
      const rows = results.shift() || [];
      const query = { from: vi.fn(), where: vi.fn(), innerJoin: vi.fn(), for: mockLock,
        then: (resolve: (value: unknown) => unknown) => Promise.resolve(rows).then(resolve) };
      query.from.mockReturnValue(query);
      query.where.mockReturnValue(query);
      query.innerJoin.mockReturnValue(query);
      mockLock.mockImplementation(() => Promise.resolve(rows));
      return query;
    });
    mockUpdate.mockReturnValue({ set: vi.fn(() => ({ where: vi.fn(() => ({
      returning: vi.fn(async () => [{ ...existing, leaseToken: 'claimed' }]),
      then: (resolve: (value: unknown) => unknown) => Promise.resolve([]).then(resolve)
    })) })) });
    mockInsert.mockReturnValue({ values: vi.fn(() => ({ returning: vi.fn(async () => [{ id: 10 }]) })) });
  });
  afterEach(() => vi.useRealTimers());

  it('rejects a missing/foreign invoice before creating an attempt', async () => {
    results.push([]);
    await expect(reserveInvoiceEmailAttemptInDb(request)).rejects.toThrow('email-invoice-not-found');
    expect(mockLock).toHaveBeenCalledWith('update');
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it.each(['draft', 'voided'])('rejects %s invoices without a delivery insert', async (lifecycleStatus) => {
    results.push([{ ...invoice, lifecycleStatus }], []);
    await expect(reserveInvoiceEmailAttemptInDb(request)).rejects.toThrow('email-requires-issued');
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('recognizes unchanged JSONB content even when its keys are reordered', async () => {
    const reordered = Object.fromEntries(Object.entries(content).reverse());
    results.push([invoice], [{ ...existing, content: reordered, status: 'sent' }]);
    expect(await reserveInvoiceEmailAttemptInDb(request)).toMatchObject({ claimed: false, attempt: { status: 'sent' } });
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('rejects changed content under the same key', async () => {
    results.push([invoice], [{ ...existing, content: { ...content, message: 'Changed' } }]);
    await expect(reserveInvoiceEmailAttemptInDb(request)).rejects.toThrow('email-attempt-conflict');
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('returns an active concurrent lease instead of claiming or creating another attempt', async () => {
    results.push([invoice], [{ ...existing, status: 'queued', leaseUntil: '2026-09-26T10:01:00Z' }]);
    expect(await reserveInvoiceEmailAttemptInDb(request)).toMatchObject({ claimed: false });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('prevents a fresh key from bypassing an unresolved send', async () => {
    results.push([invoice], [], [existing]);
    await expect(reserveInvoiceEmailAttemptInDb(request)).rejects.toThrow('email-unresolved-attempt');
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('refuses safe recovery after the provider window expired', async () => {
    results.push([invoice], [{ ...existing, recoveryExpiresAt: '2026-09-26T09:59:00Z' }]);
    await expect(reserveInvoiceEmailAttemptInDb({ userId: 2, invoiceId: 7, deliveryId: 9 })).rejects.toThrow('email-recovery-expired');
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('requires confirmation to replace an expired unknown send', async () => {
    results.push([invoice], [], [{ ...existing, recoveryExpiresAt: '2026-09-26T09:59:00Z' }]);
    await expect(reserveInvoiceEmailAttemptInDb({ ...request, replacesDeliveryId: 9 })).rejects.toThrow('email-unresolved-attempt');
  });

  it('preserves old uncertainty and creates a new attempt only after confirmation', async () => {
    const expired = { ...existing, recoveryExpiresAt: '2026-09-26T09:59:00Z' };
    results.push([invoice], [], [expired], [expired]);
    expect(await reserveInvoiceEmailAttemptInDb({ ...request, replacesDeliveryId: 9, confirmPossibleDuplicate: true })).toMatchObject({ claimed: true });
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockInsert).toHaveBeenCalledTimes(1);
  });

  it('rechecks the actual payment balance for reminders before creating an attempt', async () => {
    results.push([invoice], [], [{ amount: '100.00' }]);
    await expect(reserveInvoiceEmailAttemptInDb({ ...request, content: { ...content, kind: 'reminder' } })).rejects.toThrow('email-reminder-paid');
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('permits a reminder before its due date when a partial balance remains', async () => {
    results.push([{ ...invoice, dueDate: '2026-10-20' }], [], [{ amount: '40.00' }], []);
    expect(await reserveInvoiceEmailAttemptInDb({ ...request, content: { ...content, kind: 'reminder' } })).toMatchObject({ claimed: true });
    expect(mockInsert).toHaveBeenCalledTimes(1);
  });

  it('stops recovery without another send if payment arrived after an unknown reminder', async () => {
    results.push([invoice], [{ ...existing, content: { ...content, kind: 'reminder' } }], [{ amount: '100.00' }]);
    expect(await reserveInvoiceEmailAttemptInDb({ userId: 2, invoiceId: 7, deliveryId: 9 })).toMatchObject({ claimed: false });
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockInsert).not.toHaveBeenCalled();
  });
});
