import { describe, expect, it } from 'vitest';

import { getInvoiceDueStatus, getInvoicePaymentStatus } from '../invoice';

const invoice = {
  lifecycleStatus: 'issued', totalAmount: '100.00', paidAmount: '40.00', outstandingAmount: '60.00',
  dueDate: '2026-03-28', status: 'paid'
};

describe('invoice payment display', () => {
  it('keeps partial status visible alongside overdue and derives both from the balance', () => {
    expect(getInvoicePaymentStatus(invoice)).toBe('partial');
    expect(getInvoiceDueStatus(invoice, new Date('2026-03-28T22:30:00Z')))
      .toEqual({ isPastDue: true, daysPastDue: 1 });
    expect(getInvoiceDueStatus({ ...invoice, outstandingAmount: '0.00' }, new Date('2026-03-29T10:00:00Z')).isPastDue).toBe(false);
  });

  it('treats zero totals, drafts, and voided invoices separately from payment status', () => {
    for (const lifecycleStatus of ['draft', 'voided']) {
      expect(getInvoicePaymentStatus({ ...invoice, lifecycleStatus })).toBe(lifecycleStatus);
      expect(getInvoiceDueStatus({ ...invoice, lifecycleStatus }, new Date('2026-04-01')).isPastDue).toBe(false);
    }
    const zero = { ...invoice, totalAmount: '0.00', paidAmount: '0.00', outstandingAmount: '0.00' };
    expect(getInvoicePaymentStatus(zero)).toBe('no_payment_due');
    expect(getInvoiceDueStatus(zero, new Date('2026-04-01')).isPastDue).toBe(false);
  });

  it('uses calendar days across Lithuania’s daylight-saving boundary', () => {
    expect(getInvoiceDueStatus(invoice, new Date('2026-03-29T21:30:00Z')))
      .toEqual({ isPastDue: true, daysPastDue: 2 });
  });
});
