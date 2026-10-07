import type {
  DashboardMonth,
  DashboardOverdueInvoice
} from '@invoicetrackr/types';

import { fromCents, toCents } from './money';

export const OVERDUE_PREVIEW_LIMIT = 5;

type MonthlyIncomeRow = { month: number; amount: string };
type MonthlyExpenseRow = { month: number; total: string; deductible: string };

export type OpenInvoiceRow = {
  id: number;
  invoiceId: string | null;
  clientName: string | null;
  clientEmail: string | null;
  totalAmount: string;
  paidAmount: string;
  dueDate: string;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(to) - Date.parse(from)) / DAY_IN_MS);

export const buildMonthlySummary = (
  incomeRows: MonthlyIncomeRow[],
  expenseRows: MonthlyExpenseRow[]
) => {
  const months = Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    receivedIncome: 0n,
    expenses: 0n,
    deductibleExpenses: 0n
  }));

  incomeRows.forEach((row) => {
    months[row.month - 1].receivedIncome += toCents(row.amount);
  });
  expenseRows.forEach((row) => {
    months[row.month - 1].expenses += toCents(row.total);
    months[row.month - 1].deductibleExpenses += toCents(row.deductible);
  });

  const sum = (key: 'receivedIncome' | 'expenses' | 'deductibleExpenses') =>
    fromCents(months.reduce((total, month) => total + month[key], 0n));

  return {
    monthly: months.map<DashboardMonth>((month) => ({
      month: month.month,
      receivedIncome: fromCents(month.receivedIncome),
      expenses: fromCents(month.expenses),
      deductibleExpenses: fromCents(month.deductibleExpenses)
    })),
    receivedIncome: sum('receivedIncome'),
    expenses: sum('expenses'),
    deductibleExpenses: sum('deductibleExpenses')
  };
};

export const summarizeOpenInvoices = (rows: OpenInvoiceRow[], today: string) => {
  let outstanding = 0n;
  let overdue = 0n;
  const overdueInvoices: DashboardOverdueInvoice[] = [];

  rows.forEach((row) => {
    const balance = toCents(row.totalAmount) - toCents(row.paidAmount);
    if (balance <= 0n) return;

    outstanding += balance;
    if (row.dueDate >= today) return;

    overdue += balance;
    overdueInvoices.push({
      id: row.id,
      invoiceId: row.invoiceId,
      clientName: row.clientName ?? '',
      clientEmail: row.clientEmail?.trim() || null,
      totalAmount: row.totalAmount,
      outstandingAmount: fromCents(balance),
      dueDate: row.dueDate,
      daysOverdue: daysBetween(row.dueDate, today)
    });
  });

  overdueInvoices.sort(
    (first, second) => second.daysOverdue - first.daysOverdue || first.id - second.id
  );

  return {
    outstanding: fromCents(outstanding),
    overdue: fromCents(overdue),
    overdueCount: overdueInvoices.length,
    overdueWithoutEmail: overdueInvoices.filter((invoice) => !invoice.clientEmail)
      .length,
    overdueInvoices: overdueInvoices.slice(0, OVERDUE_PREVIEW_LIMIT)
  };
};
