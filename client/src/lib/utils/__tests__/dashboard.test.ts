import { describe, expect, it } from 'vitest';

import { formatMoney } from '../currency';
import { dashboardLinks, monthRange, subtractMoney, yearRange } from '../dashboard';

describe('dashboard links and money', () => {
  it('links each summary to the records it is computed from', () => {
    const year = yearRange(2026);
    expect(dashboardLinks.receivedIncome(year)).toBe('/invoices?paidFrom=2026-01-01&paidTo=2026-12-31');
    expect(dashboardLinks.invoiced(year)).toBe('/invoices?issuedFrom=2026-01-01&issuedTo=2026-12-31');
    expect(dashboardLinks.outstanding()).toBe('/invoices?status=open');
    expect(dashboardLinks.overdue()).toBe('/invoices?overdue=1');
    expect(dashboardLinks.expenses(monthRange(2024, 2))).toBe('/expenses?from=2024-02-01&to=2024-02-29');
    expect(dashboardLinks.deductibleExpenses(year)).toBe('/expenses?from=2026-01-01&to=2026-12-31&deductible=1');
  });

  it.each([
    ['100.00', '33.33', '66.67'],
    ['0.10', '0.30', '-0.20'],
    ['5', '5.00', '0.00']
  ])('subtracts %s - %s in cents', (first, second, expected) => {
    expect(subtractMoney(first, second)).toBe(expected);
  });

  it('formats euro amounts for the active locale', () => {
    expect(formatMoney('1234.5', 'en')).toBe('€1,234.50');
    expect(formatMoney('1234.5', 'lt').replace(/\s/g, ' ')).toBe('1 234,50 €');
  });
});
