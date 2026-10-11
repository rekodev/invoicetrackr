import type {
  SaveTaxProfileResponse,
  TaxEstimateResponse,
  TaxProfileBody
} from '@invoicetrackr/types';

import api from './api-instance';

export const getTaxEstimate = async (userId: number, year: number) =>
  await api.get<TaxEstimateResponse>(`/api/${userId}/tax-estimate`, {
    params: { year }
  });

export const saveTaxProfile = async (
  userId: number,
  year: number,
  profile: TaxProfileBody
) =>
  await api.put<SaveTaxProfileResponse>(
    `/api/${userId}/tax-profiles/${year}`,
    profile
  );
