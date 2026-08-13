'use server';

import type { CryptoWalletBody } from '@invoicetrackr/types';
import { revalidatePath } from 'next/cache';

import {
  addCryptoWallet,
  deleteCryptoWallet,
  updateCryptoWallet
} from '@/api/crypto-wallet';
import { PAYMENT_METHODS_PAGE } from '@/lib/constants/pages';
import { isResponseError } from '@/lib/utils/error';
import { mapValidationErrors } from '@/lib/utils/validation';

const toAction = (response: Awaited<ReturnType<typeof addCryptoWallet>>) =>
  isResponseError(response)
    ? {
        ok: false,
        message: response.data.message,
        validationErrors: mapValidationErrors(response.data.errors)
      }
    : {
        ok: true,
        message: response.data.message,
        data: { cryptoWallet: response.data.cryptoWallet }
      };

export const addCryptoWalletAction = async (
  userId: number,
  wallet: CryptoWalletBody
) => {
  const response = await addCryptoWallet(userId, wallet);
  revalidatePath(PAYMENT_METHODS_PAGE);
  return toAction(response);
};
export const updateCryptoWalletAction = async (
  userId: number,
  wallet: CryptoWalletBody
) => {
  const response = await updateCryptoWallet(userId, wallet);
  revalidatePath(PAYMENT_METHODS_PAGE);
  return toAction(response);
};
export const deleteCryptoWalletAction = async (userId: number, id: number) => {
  const response = await deleteCryptoWallet(userId, id);
  revalidatePath(PAYMENT_METHODS_PAGE);
  return isResponseError(response)
    ? { ok: false, message: response.data.message }
    : { ok: true, message: response.data.message };
};
