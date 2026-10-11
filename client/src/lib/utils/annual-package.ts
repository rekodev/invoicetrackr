import type {
  AnnualPackageSummary,
  AnnualPackageWarningCode,
  TaxEstimateResponse,
  TaxExpenseMethod
} from '@invoicetrackr/types';

import {
  PROFILE_PAGE,
  REPORTS_TAXES_PAGE
} from '@/lib/constants/pages';

import { dashboardLinks, subtractMoney, yearRange } from './dashboard';
import { taxEstimateHref } from './tax';

export const annualPackageExportHref = (year: number) =>
  `${REPORTS_TAXES_PAGE}/export?year=${year}`;

export const annualPackageExportErrorHref = (year: number) =>
  `${taxEstimateHref(year)}&export_error=1`;

const WARNING_LINKS: Partial<
  Record<AnnualPackageWarningCode, (_year: number) => string>
> = {
  missing_tax_profile: taxEstimateHref,
  missing_owner_details: () => PROFILE_PAGE,
  draft_invoices: (year) => dashboardLinks.drafts(yearRange(year)),
  outstanding_invoices: (year) => dashboardLinks.outstanding(yearRange(year)),
  expenses_missing_documents: (year) =>
    dashboardLinks.expensesMissingDocuments(yearRange(year))
};

export const annualPackageWarningHref = (
  code: AnnualPackageWarningCode,
  year: number
) => WARNING_LINKS[code]?.(year);

export type DeclarationFigure = {
  key: 'income' | 'income_vat' | 'income_net' | 'deductions' | 'actual_expenses' | 'profit' | 'net';
  amount: string;
  copyable: boolean;
  method?: TaxExpenseMethod;
};

export const declarationFigures = (
  summary: AnnualPackageSummary,
  estimate: TaxEstimateResponse
): DeclarationFigure[] => {
  const received: DeclarationFigure[] = [
    { key: 'income', amount: summary.income, copyable: false },
    { key: 'income_vat', amount: summary.incomeVat, copyable: false },
    { key: 'income_net', amount: summary.incomeNet, copyable: true }
  ];

  if (estimate.status !== 'ready') {
    return [
      ...received,
      { key: 'actual_expenses', amount: summary.expenses, copyable: false },
      { key: 'net', amount: summary.net, copyable: false }
    ];
  }

  const method = estimate.profile.expenseMethod;
  const chosen =
    method === 'actual' ? estimate.methods.actual : estimate.methods.thirtyPercent;

  return [
    ...received,
    { key: 'deductions', amount: chosen.deductions, copyable: true, method },
    {
      key: 'profit',
      amount: subtractMoney(chosen.income, chosen.deductions),
      copyable: false
    }
  ];
};
