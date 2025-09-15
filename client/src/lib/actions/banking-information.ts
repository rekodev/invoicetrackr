'use server';

import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';

import {
  addBankingInformation,
  deleteBankingInformation,
  updateUserSelectedBankAccount
} from '@/api';

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
    return { ok: true };
  } catch {
    return { ok: false, message: t('general_error') };
  }
}

export async function deleteBankingInformationAction(
  userId: number,
  bankAccountId: number
): Promise<ActionResponseModel> {
  const t = await getTranslations();

  try {
    const response = await deleteBankingInformation(userId, bankAccountId);

    if ('errors' in response.data) {
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

export async function updateUserSelectedBankAccountAction(
  userId: number,
  bankAccountId: number | undefined
): Promise<ActionResponseModel> {
  const t = await getTranslations();

  try {
    if (!bankAccountId) return { ok: false, message: t('general_error') };

    const response = await updateUserSelectedBankAccount(userId, bankAccountId);

    if ('errors' in response.data) {
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
