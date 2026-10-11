import type {
  AnnualPackageSummary,
  AnnualPackageWarning,
  JournalTotals
} from '@invoicetrackr/types';

import type {
  AnnualExpenseDbRow,
  AnnualInvoiceDbRow
} from '../database/annual-package';
import { fromCents, toCents } from './money';
import { selectedMethodEstimate, type TaxEstimate } from './tax';

export type AnnualInvoice = AnnualInvoiceDbRow & {
  isVoided: boolean;
  outstandingAmount: string;
};

type AnnualOwner = { legalName: string; activityCertificateNumber: string };

export const sumMoney = (values: string[]) =>
  fromCents(values.reduce((sum, value) => sum + toCents(value), 0n));

export const buildAnnualInvoices = (
  rows: AnnualInvoiceDbRow[]
): AnnualInvoice[] =>
  rows.map((row) => {
    const isVoided = row.lifecycleStatus === 'voided';
    const balance =
      !isVoided && row.status === 'pending'
        ? toCents(row.totalAmount) - toCents(row.paidAmount)
        : 0n;

    return {
      ...row,
      isVoided,
      outstandingAmount: fromCents(balance > 0n ? balance : 0n)
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
  const counted = invoices.filter((invoice) => !invoice.isVoided);
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
  owner: AnnualOwner;
  estimate: TaxEstimate;
  draftCount: number;
  invoices: AnnualInvoice[];
  expenses: Pick<AnnualExpenseDbRow, 'documentCount'>[];
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
    invoices.filter((invoice) => toCents(invoice.outstandingAmount) > 0n)
      .length
  );
  recommend(
    'expenses_missing_documents',
    expenses.filter((expense) => expense.documentCount === 0).length
  );

  return warnings;
};

export const isAnnualPackageComplete = (warnings: AnnualPackageWarning[]) =>
  warnings.every((warning) => warning.severity !== 'blocking');
