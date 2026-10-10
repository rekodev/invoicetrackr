import type {
  JournalExpenseRow,
  JournalIncomeRow,
  JournalPeriod,
  JournalRow,
  JournalTotals
} from '@invoicetrackr/types';

import { fromCents, roundPositiveDivision, toCents } from './money';

export type JournalIncomeDbRow = {
  paymentId: number;
  paymentDate: string;
  invoiceId: number;
  documentNumber: string | null;
  receiverName: string;
  receiverBusinessNumber: string | null;
  descriptions: string;
  receivedAmount: string;
  paidBefore: string;
  vatAmount: string;
  totalAmount: string;
};

export type JournalExpenseDbRow = {
  expenseId: number;
  expenseDate: string;
  documentNumber: string | null;
  supplier: string;
  description: string;
  eurAmount: string;
  businessUsePercentage: string;
  deductibleAmount: string;
};

type JournalMonth = { month: number } & JournalTotals;

const pad = (value: number) => String(value).padStart(2, '0');

export const journalPeriod = (year: number, month?: number): JournalPeriod => {
  if (!month) {
    return { year, month: null, from: `${year}-01-01`, to: `${year}-12-31` };
  }

  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return {
    year,
    month,
    from: `${year}-${pad(month)}-01`,
    to: `${year}-${pad(month)}-${pad(lastDay)}`
  };
};

export const paymentVatShare = ({
  vatAmount,
  totalAmount,
  paidBefore,
  receivedAmount
}: Pick<
  JournalIncomeDbRow,
  'vatAmount' | 'totalAmount' | 'paidBefore' | 'receivedAmount'
>) => {
  const vat = toCents(vatAmount);
  const total = toCents(totalAmount);

  if (vat === 0n || total === 0n) return 0n;

  const before = toCents(paidBefore);
  const after = before + toCents(receivedAmount);
  const vatUpTo = (paid: bigint) =>
    roundPositiveDivision(vat * (paid > total ? total : paid), total);

  return vatUpTo(after) - vatUpTo(before);
};

const toIncomeRow = (row: JournalIncomeDbRow): JournalIncomeRow => {
  const amount = toCents(row.receivedAmount);
  const vat = paymentVatShare(row);

  return {
    kind: 'income',
    date: row.paymentDate,
    documentNumber: row.documentNumber,
    counterparty: row.receiverName,
    counterpartyCode: row.receiverBusinessNumber || null,
    description: row.descriptions,
    invoiceId: row.invoiceId,
    paymentId: row.paymentId,
    amount: fromCents(amount),
    vatAmount: fromCents(vat),
    netAmount: fromCents(amount - vat)
  };
};

const toExpenseRow = (row: JournalExpenseDbRow): JournalExpenseRow => ({
  kind: 'expense',
  date: row.expenseDate,
  documentNumber: row.documentNumber,
  counterparty: row.supplier,
  description: row.description,
  expenseId: row.expenseId,
  amount: row.deductibleAmount,
  totalEurAmount: row.eurAmount,
  businessUsePercentage: row.businessUsePercentage
});

const sumJournalRows = (rows: JournalRow[]): JournalTotals => {
  let income = 0n;
  let incomeVat = 0n;
  let expenses = 0n;

  rows.forEach((row) => {
    if (row.kind === 'income') {
      income += toCents(row.amount);
      incomeVat += toCents(row.vatAmount);
    } else {
      expenses += toCents(row.amount);
    }
  });

  return {
    income: fromCents(income),
    incomeVat: fromCents(incomeVat),
    incomeNet: fromCents(income - incomeVat),
    expenses: fromCents(expenses),
    net: fromCents(income - incomeVat - expenses)
  };
};

export const buildJournal = (
  incomeRows: JournalIncomeDbRow[],
  expenseRows: JournalExpenseDbRow[]
) => {
  const rows: JournalRow[] = [
    ...incomeRows.map(toIncomeRow),
    ...expenseRows.map(toExpenseRow)
  ].sort((left, right) => left.date.localeCompare(right.date));

  return { rows, totals: sumJournalRows(rows) };
};

export const buildJournalMonths = (
  rows: JournalRow[],
  period: JournalPeriod
): JournalMonth[] => {
  const months = period.month
    ? [period.month]
    : Array.from({ length: 12 }, (_, index) => index + 1);

  return months.map((month) => ({
    month,
    ...sumJournalRows(rows.filter((row) => Number(row.date.slice(5, 7)) === month))
  }));
};
