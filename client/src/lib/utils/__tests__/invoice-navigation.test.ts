import { describe, expect, it } from 'vitest';

import {
  invoiceListQueryHref,
  parseInvoiceListQuery
} from '../invoice-navigation';

const defaults = {
  page: 1,
  pageSize: 10,
  sort: 'date',
  direction: 'descending'
};

describe('invoice list navigation', () => {
  it('parses supported params, drops invalid ones, and writes only non-default values back', () => {
    const query = parseInvoiceListQuery({
      q: '  sf ',
      status: 'open',
      lifecycle: 'issued',
      overdue: '1',
      issuedFrom: '2026-01-01',
      issuedTo: '2026-12-31',
      paidFrom: '2026-04-01',
      paidTo: 'bad',
      page: '2',
      pageSize: '15',
      sort: 'receiver',
      direction: 'ascending'
    });

    expect(query).toEqual({
      q: 'sf',
      status: 'open',
      lifecycle: 'issued',
      overdue: '1',
      issuedFrom: '2026-01-01',
      issuedTo: '2026-12-31',
      paidFrom: '2026-04-01',
      page: 2,
      pageSize: 15,
      sort: 'receiver',
      direction: 'ascending'
    });
    expect(invoiceListQueryHref(query)).toBe(
      '/invoices?page=2&pageSize=15&q=sf&status=open&lifecycle=issued&overdue=1&issuedFrom=2026-01-01&issuedTo=2026-12-31&paidFrom=2026-04-01&sort=receiver&direction=ascending'
    );
  });

  it.each([
    [{}],
    [{ status: 'unknown', lifecycle: 'sent', page: '0', pageSize: '500', sort: 'secret', direction: 'up' }],
    [{ status: ['open', 'paid'], page: '1.5', overdue: 'yes' }]
  ])('falls back to defaults for %j', (params) => {
    const query = parseInvoiceListQuery(params);

    expect(query).toEqual(defaults);
    expect(invoiceListQueryHref(query)).toBe('/invoices');
  });
});
