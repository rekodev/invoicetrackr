'use server';

import { revalidatePath } from 'next/cache';

import {
  addBankingInformation,
  deleteBankingInformation,
  updateBankingInformation
} from '@/api/banking-information';

import { BANKING_INFORMATION_PAGE, ONBOARDING_PAGE } from '../constants/pages';
import { ActionResponseModel } from '../types/action';
import { BankAccountBody } from '@invoicetrackr/types';
import { isResponseError } from '../utils/error';
import { mapValidationErrors } from '../utils/validation';

export async function addBankingInformationAction(
  userId: number,
  bankingInformation: BankAccountBody,
  hasSelectedBankAccount: boolean,
  isUserOnboarding?: boolean
): Promise<ActionResponseModel> {
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

  revalidatePath(isUserOnboarding ? ONBOARDING_PAGE : BANKING_INFORMATION_PAGE);
  return { ok: true, message: response.data.message };
}

export async function updateBankingInformationAction(
  userId: number,
  bankingInformation: BankAccountBody
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
  const response = await deleteBankingInformation(userId, bankAccountId);

  if (isResponseError(response)) {
    return {
      ok: false,
      message: response.data.message
    };
  }

  revalidatePath(BANKING_INFORMATION_PAGE);
  return { ok: true, message: response.data.message };
}
