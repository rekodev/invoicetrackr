import type { InvoiceListItem } from '@invoicetrackr/types';
import { describe, expect, it } from 'vitest';

import {
  matchesInvoiceListFilters,
  readInvoiceListState,
  writeInvoiceListState
} from '../invoice-navigation';

const invoice = {
  id: 7,
  invoiceId: 'SF007',
  receiver: { name: 'Test Client' },
  totalAmount: '120.00',
  paidAmount: '40.00',
  outstandingAmount: '80.00',
  date: '2026-03-10',
  dueDate: '2026-03-24',
  lifecycleStatus: 'issued',
  status: 'pending',
  paymentDates: ['2026-04-02']
} as InvoiceListItem;

const noFilters = readInvoiceListState(new URLSearchParams());

describe('invoice list navigation', () => {
  it('round-trips supported filters and drops invalid ones', () => {
    const state = readInvoiceListState(new URLSearchParams(
      'q=sf&status=open&overdue=1&issuedFrom=2026-01-01&issuedTo=2026-12-31&paidFrom=2026-04-01&paidTo=bad'
    ));
    expect(state).toEqual({
      filterValue: 'sf', statusFilter: 'open', overdueOnly: true,
      issuedFrom: '2026-01-01', issuedTo: '2026-12-31', paidFrom: '2026-04-01', paidTo: ''
    });
    expect(writeInvoiceListState(state)).toBe(
      '/invoices?q=sf&status=open&overdue=1&issuedFrom=2026-01-01&issuedTo=2026-12-31&paidFrom=2026-04-01'
    );
    expect(readInvoiceListState(new URLSearchParams('status=unknown'))).toEqual(noFilters);
    expect(writeInvoiceListState(noFilters)).toBe('/invoices');
  });

  it.each([
    ['open balance', { statusFilter: 'open' }, invoice, true],
    ['paid is not open', { statusFilter: 'open' }, { ...invoice, paidAmount: '120.00', outstandingAmount: '0.00' }, false],
    ['drafts by status', { statusFilter: 'draft' }, { ...invoice, lifecycleStatus: 'draft' }, true],
    ['issued in range', { issuedFrom: '2026-03-01', issuedTo: '2026-03-31' }, invoice, true],
    ['draft dated in issued range', { issuedFrom: '2026-03-01' }, { ...invoice, lifecycleStatus: 'draft' }, false],
    ['payment in range', { paidFrom: '2026-04-01', paidTo: '2026-04-30' }, invoice, true],
    ['payment outside range', { paidFrom: '2026-05-01' }, invoice, false],
    ['no payments', { paidTo: '2026-12-31' }, { ...invoice, paymentDates: [] }, false]
  ])('matches %s', (_name, filters, item, expected) => {
    expect(matchesInvoiceListFilters(item as InvoiceListItem, { ...noFilters, ...filters })).toBe(expected);
  });
});
