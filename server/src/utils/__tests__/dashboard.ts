import { describe, expect, it } from 'vitest';

import {
  buildMonthlySummary,
  calculateSafeToSpend,
  OpenInvoiceRow,
  summarizeOpenInvoices
} from '../dashboard';

const openInvoice = (overrides: Partial<OpenInvoiceRow>): OpenInvoiceRow => ({
  id: 1,
  invoiceId: 'INV001',
  clientName: 'Client',
  clientEmail: 'client@example.com',
  totalAmount: '100.00',
  paidAmount: '0.00',
  dueDate: '2026-10-01',
  ...overrides
});

describe('dashboard summary math', () => {
  it('zero-fills twelve months and reconciles month totals with year totals in cents', () => {
    const summary = buildMonthlySummary(
      [
        { month: 1, amount: '33.33' },
        { month: 1, amount: '0.01' },
        { month: 12, amount: '0.10' }
      ],
      [{ month: 6, total: '10.20', deductible: '5.10' }]
    );

    expect(summary.monthly).toHaveLength(12);
    expect(summary.monthly[0]).toEqual({
      month: 1,
      receivedIncome: '33.34',
      expenses: '0.00',
      deductibleExpenses: '0.00'
    });
    expect(summary.monthly[5]).toMatchObject({ expenses: '10.20', deductibleExpenses: '5.10' });
    expect(summary.monthly[11].receivedIncome).toBe('0.10');
    expect(summary).toMatchObject({
      receivedIncome: '33.44',
      expenses: '10.20',
      deductibleExpenses: '5.10'
    });
  });

  it('splits open balances into outstanding and overdue, ranking the oldest overdue first', () => {
    const today = '2026-10-07';
    const summary = summarizeOpenInvoices(
      [
        openInvoice({ id: 1, dueDate: '2026-10-07', totalAmount: '50.00' }),
        openInvoice({ id: 2, dueDate: '2026-09-27', totalAmount: '100.00', paidAmount: '40.00' }),
        openInvoice({ id: 3, dueDate: '2025-12-31', totalAmount: '20.00', clientEmail: ' ' }),
        openInvoice({ id: 4, dueDate: '2026-01-01', totalAmount: '30.00', paidAmount: '30.00' })
      ],
      today
    );

    expect(summary).toMatchObject({
      outstanding: '130.00',
      overdue: '80.00',
      overdueCount: 2,
      overdueWithoutEmail: 1
    });
    expect(summary.overdueInvoices.map(({ id, daysOverdue, outstandingAmount, clientEmail }) =>
      ({ id, daysOverdue, outstandingAmount, clientEmail }))).toEqual([
      { id: 3, daysOverdue: 280, outstandingAmount: '20.00', clientEmail: null },
      { id: 2, daysOverdue: 10, outstandingAmount: '60.00', clientEmail: 'client@example.com' }
    ]);
  });

  it('caps the overdue preview but keeps the full count and total', () => {
    const rows = Array.from({ length: 7 }, (_, index) =>
      openInvoice({ id: index + 1, dueDate: `2026-09-0${index + 1}` }));
    const summary = summarizeOpenInvoices(rows, '2026-10-07');

    expect(summary.overdueCount).toBe(7);
    expect(summary.overdue).toBe('700.00');
    expect(summary.overdueInvoices.map((invoice) => invoice.id)).toEqual([1, 2, 3, 4, 5]);
  });

  it('subtracts VAT, expenses and the reserve for the saved method, floored at zero with a shortfall', () => {
    const ready = (expenseMethod: 'actual' | 'thirty_percent') => ({
      status: 'ready' as const,
      profile: { expenseMethod },
      methods: { actual: { total: '1000.00' }, thirtyPercent: { total: '1500.50' } }
    });
    const totals = { receivedIncome: '12100.00', vatCollected: '2100.00', expenses: '1500.00' };

    expect(calculateSafeToSpend({ ...totals, estimate: ready('thirty_percent') })).toEqual({
      ...totals,
      status: 'ready',
      expenseMethod: 'thirty_percent',
      taxReserve: '1500.50',
      safeToSpend: '6999.50',
      shortfall: '0.00'
    });
    expect(
      calculateSafeToSpend({
        receivedIncome: '500.00',
        vatCollected: '0.00',
        expenses: '200.01',
        estimate: ready('actual')
      })
    ).toMatchObject({ taxReserve: '1000.00', safeToSpend: '0.00', shortfall: '700.01' });
    expect(
      calculateSafeToSpend({ ...totals, estimate: { status: 'needs_profile' } })
    ).toEqual({ ...totals, status: 'needs_profile' });
  });
});
