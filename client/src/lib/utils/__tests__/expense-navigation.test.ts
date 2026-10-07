import { describe, expect, it } from 'vitest';

import { expenseListHref, readExpenseListState, safeExpenseReturnTo } from '../expense-navigation';

describe('expense list navigation', () => {
  it('restores every supported control from the return URL', () => {
    const params = new URLSearchParams('q=internet&category=telecommunications&method=card&documents=1&deductible=1&from=2026-01-01&to=2026-12-31&sort=totalAmount&direction=ascending&page=3&pageSize=15');
    expect(readExpenseListState(params)).toEqual({
      filterValue: 'internet', categoryFilter: 'telecommunications', paymentMethodFilter: 'card', hasAttachmentFilter: true, deductibleOnly: true,
      dateFrom: '2026-01-01', dateTo: '2026-12-31', sortDescriptor: { column: 'totalAmount', direction: 'ascending' }, page: 3, rowsPerPage: 15
    });
    expect(safeExpenseReturnTo(expenseListHref(params))).toBe(`/expenses?${params}`);
  });
  it('uses defaults for invalid filters, pagination, dates, and sorting', () => {
    expect(readExpenseListState(new URLSearchParams('category=bad&method=bad&from=bad&to=2026-99-99&page=-2&pageSize=99&sort=id&direction=bad')))
      .toMatchObject({ categoryFilter: 'all', paymentMethodFilter: 'all', dateFrom: '', dateTo: '', page: 1, rowsPerPage: 10, sortDescriptor: { column: 'expenseDate', direction: 'descending' } });
  });
  it.each(['https://external.example/expenses', '//external.example/expenses', '/invoices', '/expenses/10', '/expenses\\evil', '/expenses\n?x=1'])('rejects unsafe return target %s', (value) => {
    expect(safeExpenseReturnTo(value)).toBe('/expenses');
  });
});
