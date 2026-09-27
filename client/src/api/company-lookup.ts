import type {
  CompanyLookupRequest,
  CompanyLookupResponse
} from '@invoicetrackr/types';

import api from './api-instance';

export const searchCompanyLookups = async (
  userId: number,
  request: CompanyLookupRequest
) =>
  await api.post<CompanyLookupResponse>(
    `/api/${userId}/company-lookups/search`,
    request
  );
