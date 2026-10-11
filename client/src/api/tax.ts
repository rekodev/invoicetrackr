import type {
  SaveTaxProfileResponse,
  TaxProfileBody
} from '@invoicetrackr/types';

import api from './api-instance';

export const saveTaxProfile = async (
  userId: number,
  year: number,
  profile: TaxProfileBody
) =>
  await api.put<SaveTaxProfileResponse>(
    `/api/${userId}/tax-profiles/${year}`,
    profile
  );
