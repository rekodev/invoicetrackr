'use server';

import type { CompanyLookupResult } from '@invoicetrackr/types';

import { searchCompanyLookups } from '@/api/company-lookup';

import { isResponseError } from '../utils/error';

export type CompanyLookupActionResult =
  | { ok: true; results: CompanyLookupResult[] }
  | { ok: false; message: string };

export const searchCompanyLookupsAction = async ({
  userId,
  query
}: {
  userId: number;
  query: string;
}): Promise<CompanyLookupActionResult> => {
  const response = await searchCompanyLookups(userId, { query });

  if (isResponseError(response)) {
    return { ok: false, message: response.data.message };
  }

  return { ok: true, results: response.data.results };
};
