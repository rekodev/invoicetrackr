import type {
  AnnualPackageSummary,
  AnnualPackageWarning,
  JournalTotals
} from '@invoicetrackr/types';

import type {
  AnnualExpenseDbRow,
  AnnualInvoiceDbRow
} from '../database/annual-package';
import type { JournalExportInput } from './journal-export';
import { fromCents, sumMoney, toCents } from './money';
import { selectedMethodEstimate, type TaxEstimate } from './tax';

export type AnnualInvoice = AnnualInvoiceDbRow & {
  outstandingAmount: string;
  yearEndStatus: 'paid' | 'pending' | 'voided';
  isOpen: boolean;
};

export type AnnualExpense = AnnualExpenseDbRow & { documentCount: number };

export const isCounted = (invoice: AnnualInvoice) =>
  invoice.yearEndStatus !== 'voided';

export const buildAnnualInvoices = (
  rows: AnnualInvoiceDbRow[]
): AnnualInvoice[] =>
  rows.map((row) => {
    const isVoided = row.lifecycleStatus === 'voided';
    const balance = isVoided
      ? 0n
      : toCents(row.totalAmount) - toCents(row.paidAmount);
    const outstanding = balance > 0n ? balance : 0n;

    return {
      ...row,
      outstandingAmount: fromCents(outstanding),
      yearEndStatus: isVoided ? 'voided' : outstanding > 0n ? 'pending' : 'paid',
      isOpen:
        !isVoided && row.status === 'pending' && toCents(row.totalAmount) > 0n
    };
  });

export const buildAnnualSummary = ({
  totals,
  invoices,
  estimate
}: {
  totals: JournalTotals;
  invoices: AnnualInvoice[];
  estimate: TaxEstimate;
}): AnnualPackageSummary => {
  const counted = invoices.filter(isCounted);
  const method =
    estimate.status === 'ready' ? selectedMethodEstimate(estimate) : null;

  return {
    ...totals,
    invoiced: sumMoney(counted.map((invoice) => invoice.totalAmount)),
    outstanding: sumMoney(counted.map((invoice) => invoice.outstandingAmount)),
    expenseMethod: method?.method ?? null,
    taxTotal: method?.total ?? null
  };
};

export const buildAnnualWarnings = ({
  year,
  today,
  owner,
  estimate,
  draftCount,
  invoices,
  expenses
}: {
  year: number;
  today: string;
  owner: JournalExportInput['owner'];
  estimate: TaxEstimate;
  draftCount: number;
  invoices: AnnualInvoice[];
  expenses: Pick<AnnualExpense, 'documentCount'>[];
}): AnnualPackageWarning[] => {
  const warnings: AnnualPackageWarning[] = [];
  const recommend = (code: AnnualPackageWarning['code'], count: number) => {
    if (count > 0) warnings.push({ code, severity: 'recommendation', count });
  };

  if (today <= `${year}-12-31`) {
    warnings.push({ code: 'year_in_progress', severity: 'blocking' });
  }
  if (estimate.status === 'unsupported_year') {
    warnings.push({ code: 'unsupported_tax_year', severity: 'blocking' });
  }
  if (estimate.status === 'needs_profile') {
    warnings.push({ code: 'missing_tax_profile', severity: 'blocking' });
  }
  if (!owner.legalName.trim() || !owner.activityCertificateNumber.trim()) {
    warnings.push({ code: 'missing_owner_details', severity: 'blocking' });
  }

  recommend('draft_invoices', draftCount);
  recommend(
    'outstanding_invoices',
    invoices.filter((invoice) => invoice.isOpen).length
  );
  recommend(
    'expenses_missing_documents',
    expenses.filter((expense) => expense.documentCount === 0).length
  );

  return warnings;
};

export const isAnnualPackageComplete = (warnings: AnnualPackageWarning[]) =>
  warnings.every((warning) => warning.severity !== 'blocking');
