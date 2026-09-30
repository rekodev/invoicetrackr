import { describe, expect, it } from 'vitest';

import { summarizeClientInvoices } from '../client-workspace';

const row = (id: number, lifecycleStatus: string, totalAmount: string, paidAmount: string) => ({
  id,
  invoiceId: `SF${id}`,
  date: '2026-09-01',
  dueDate: '2026-09-30',
  lifecycleStatus,
  status: 'pending',
  totalAmount,
  paidAmount
});

describe('client invoice summary', () => {
  it('reconciles issued invoices with full and partial payments, excluding drafts and voids', () => {
    const result = summarizeClientInvoices([
      row(1, 'issued', '100.00', '40.00'),
      row(2, 'issued', '25.50', '25.50'),
      row(3, 'draft', '300.00', '0.00'),
      row(4, 'voided', '20.00', '0.00')
    ]);

    expect(result.totals).toEqual({
      invoicedAmount: '125.50',
      paidAmount: '65.50',
      outstandingAmount: '60.00'
    });
    expect(result.invoices.map(({ paidAmount, outstandingAmount }) => ({ paidAmount, outstandingAmount }))).toEqual([
      { paidAmount: '40.00', outstandingAmount: '60.00' },
      { paidAmount: '25.50', outstandingAmount: '0.00' },
      { paidAmount: null, outstandingAmount: null },
      { paidAmount: null, outstandingAmount: null }
    ]);
  });

  it('returns zero amounts for a client without invoices', () => {
    expect(summarizeClientInvoices([]).totals).toEqual({
      invoicedAmount: '0.00', paidAmount: '0.00', outstandingAmount: '0.00'
    });
  });
});
