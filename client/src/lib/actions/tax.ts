'use server';

import type { TaxProfileBody } from '@invoicetrackr/types';
import { revalidatePath } from 'next/cache';

import { saveTaxProfile } from '@/api/tax';

import { REPORTS_TAXES_PAGE } from '../constants/pages';
import type { ActionResponseModel } from '../types/action';
import { isResponseError } from '../utils/error';
import { mapValidationErrors } from '../utils/validation';

export const saveTaxProfileAction = async ({
  userId,
  year,
  profile
}: {
  userId: number;
  year: number;
  profile: TaxProfileBody;
}): Promise<ActionResponseModel> => {
  const response = await saveTaxProfile(userId, year, profile);

  if (isResponseError(response)) {
    return {
      ok: false,
      message: response.data.message,
      validationErrors: mapValidationErrors(response.data.errors)
    };
  }

  revalidatePath(REPORTS_TAXES_PAGE);

  return { ok: true, message: response.data.message };
};
