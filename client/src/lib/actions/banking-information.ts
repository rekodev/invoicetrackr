'use server';

import { getTranslations } from 'next-intl/server';
import { revalidatePath } from 'next/cache';

import {
  addBankingInformation,
  deleteBankingInformation,
  updateBankingInformation
} from '@/api';

import { BANKING_INFORMATION_PAGE, ONBOARDING_PAGE } from '../constants/pages';
import { ActionResponseModel } from '../types/response';
import { BankingInformationFormModel } from '../types/models/user';
import { isResponseError } from '../utils/error';
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

    if (isResponseError(response)) {
      return {
        ok: false,
        message: response.data.message,
        validationErrors: mapValidationErrors(response.data.errors)
      };
    }

    revalidatePath(
      isUserOnboarding ? ONBOARDING_PAGE : BANKING_INFORMATION_PAGE
    );
    return { ok: true };
  } catch {
    return { ok: false, message: t('general_error') };
  }
}

export async function updateBankingInformationAction(
  userId: number,
  bankingInformation: BankingInformationFormModel
): Promise<ActionResponseModel> {
  const response = await updateBankingInformation(userId, bankingInformation);

  if (isResponseError(response)) {
    return {
      ok: false,
      message: response.data.message,
      validationErrors: mapValidationErrors(response.data.errors)
    };
  }

  revalidatePath(BANKING_INFORMATION_PAGE);
  return { ok: true, message: response.data.message };
}

export async function deleteBankingInformationAction(
  userId: number,
  bankAccountId: number
): Promise<ActionResponseModel> {
  const t = await getTranslations();

  try {
    const response = await deleteBankingInformation(userId, bankAccountId);

    if (isResponseError(response)) {
      return {
        ok: false,
        message: response.data.message,
        validationErrors: mapValidationErrors(response.data.errors)
      };
    }

    revalidatePath(BANKING_INFORMATION_PAGE);
    return { ok: true };
  } catch {
    return { ok: false, message: t('general_error') };
  }
}
