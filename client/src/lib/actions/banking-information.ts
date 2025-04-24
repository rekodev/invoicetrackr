'use server';

import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';

import { addBankingInformation } from '@/api';

import { BANKING_INFORMATION_PAGE, ONBOARDING_PAGE } from '../constants/pages';
import { BankingInformationFormModel } from '../types/models/user';
import { ActionResponseModel } from '../types/response';
import { mapValidationErrors } from '../utils/validation';

export async function addBankingInformationAction(
  userId: number,
  bankingInformation: BankingInformationFormModel,
  hasSelectedBankAccount: boolean,
  isUserOnboarding?: boolean
): Promise<ActionResponseModel> {
  const t = await getTranslations();

  try {
    const response = await addBankingInformation(
      userId,
      bankingInformation,
      hasSelectedBankAccount
    );

    if ('errors' in response.data) {
      return {
        ok: false,
        message: response.data.message,
        validationErrors: mapValidationErrors(response.data.errors)
      };
    }

    revalidatePath(
      isUserOnboarding ? ONBOARDING_PAGE : BANKING_INFORMATION_PAGE
    );
    return { ok: true, message: response.data.message };
  } catch {
    return { ok: false, message: t('general_error') };
  }
}
