import type { AnnualPackageWarningCode } from '@invoicetrackr/types';

import {
  FREELANCER_PROFILE_PAGE,
  REPORTS_ANNUAL_PAGE
} from '@/lib/constants/pages';

import { dashboardLinks, yearRange } from './dashboard';
import { taxEstimateHref } from './tax';

export const annualPackageHref = (year: number) =>
  `${REPORTS_ANNUAL_PAGE}?year=${year}`;

export const annualPackageExportHref = (year: number) =>
  `${REPORTS_ANNUAL_PAGE}/export?year=${year}`;

export const annualPackageExportErrorHref = (year: number) =>
  `${annualPackageHref(year)}&export_error=1`;

const WARNING_LINKS: Partial<
  Record<AnnualPackageWarningCode, (_year: number) => string>
> = {
  missing_tax_profile: taxEstimateHref,
  missing_owner_details: () => FREELANCER_PROFILE_PAGE,
  draft_invoices: () => dashboardLinks.drafts(),
  outstanding_invoices: () => dashboardLinks.outstanding(),
  expenses_missing_documents: (year) =>
    dashboardLinks.expensesMissingDocuments(yearRange(year))
};

export const annualPackageWarningHref = (
  code: AnnualPackageWarningCode,
  year: number
) => WARNING_LINKS[code]?.(year);
