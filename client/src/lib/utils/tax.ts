import type { TaxProfile, TaxProfileBody } from '@invoicetrackr/types';

import { REPORTS_TAXES_PAGE } from '@/lib/constants/pages';

export type TaxProfileFormData = Omit<
  TaxProfileBody,
  'activityStartDate' | 'activityEndDate'
> & {
  activityStartDate: string;
  activityEndDate: string;
};

export const getInitialTaxProfileData = (
  profile?: TaxProfile | null
): TaxProfileFormData => ({
  expenseMethod: profile?.expenseMethod ?? 'thirty_percent',
  hasEmploymentPsdCoverage: profile?.hasEmploymentPsdCoverage ?? false,
  hasAdditionalPensionAccumulation:
    profile?.hasAdditionalPensionAccumulation ?? false,
  activityStartDate: profile?.activityStartDate ?? '',
  activityEndDate: profile?.activityEndDate ?? '',
  otherDeclaredIncome:
    profile && Number(profile.otherDeclaredIncome) > 0
      ? profile.otherDeclaredIncome
      : ''
});

export const toTaxProfileBody = (data: TaxProfileFormData): TaxProfileBody => ({
  ...data,
  activityStartDate: data.activityStartDate || null,
  activityEndDate: data.activityEndDate || null,
  otherDeclaredIncome: data.otherDeclaredIncome.trim() || '0'
});

export const taxEstimateHref = (year: number) =>
  `${REPORTS_TAXES_PAGE}?year=${year}`;
