import { EXPENSES_PAGE } from '@/lib/constants/pages';

import { invoiceListHref } from './invoice-navigation';

const pad = (value: number) => String(value).padStart(2, '0');

export const monthRange = (year: number, month: number) => {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return {
    from: `${year}-${pad(month)}-01`,
    to: `${year}-${pad(month)}-${pad(lastDay)}`
  };
};

export const yearRange = (year: number) => ({
  from: `${year}-01-01`,
  to: `${year}-12-31`
});

const expenseListHref = (
  range: { from: string; to: string },
  extra: Record<string, string> = {}
) =>
  `${EXPENSES_PAGE}?${new URLSearchParams({ from: range.from, to: range.to, ...extra })}`;

export const dashboardLinks = {
  receivedIncome: (range: { from: string; to: string }) =>
    invoiceListHref({ paidFrom: range.from, paidTo: range.to }),
  invoiced: (range: { from: string; to: string }) =>
    invoiceListHref({ issuedFrom: range.from, issuedTo: range.to }),
  outstanding: () => invoiceListHref({ status: 'open' }),
  overdue: () => invoiceListHref({ overdue: '1' }),
  drafts: () => invoiceListHref({ status: 'draft' }),
  expenses: (range: { from: string; to: string }) => expenseListHref(range),
  deductibleExpenses: (range: { from: string; to: string }) =>
    expenseListHref(range, { deductible: '1' }),
  expensesMissingDocuments: (range: { from: string; to: string }) =>
    expenseListHref(range)
};

export const subtractMoney = (first: string, second: string) => {
  const toCents = (value: string) => {
    const [whole, fraction = ''] = value.split('.');
    return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0').slice(0, 2));
  };
  const cents = toCents(first) - toCents(second);
  const absolute = cents < 0n ? -cents : cents;
  return `${cents < 0n ? '-' : ''}${absolute / 100n}.${String(absolute % 100n).padStart(2, '0')}`;
};
