'use server';

import { revalidatePath } from 'next/cache';

import {
  changeUserPassword,
  updateUser,
  updateUserAccountSettings,
  updateUserProfilePicture
} from '@/api/user';

import {
  ACCOUNT_SETTINGS_PAGE,
  CHANGE_PASSWORD_PAGE,
  PERSONAL_INFORMATION_PAGE
} from '../constants/pages';
import { ActionResponseModel } from '../types/action';
import { Currency } from '../types/currency';
import { User } from '@invoicetrackr/types';
import { isResponseError } from '../utils/error';
import { mapValidationErrors } from '../utils/validation';
import { updateSessionAction } from '../actions';

export async function updateUserAction({
  user,
  signature
}: {
  user: User;
  signature: string | File | undefined;
}): Promise<ActionResponseModel> {
  const response = await updateUser(user.id!, {
    ...user,
    signature,
    type: 'sender'
  });

  if (isResponseError(response)) {
    return {
      ok: false,
      message: response.data.message,
      validationErrors: mapValidationErrors(response.data.errors)
    };
  }

  revalidatePath(PERSONAL_INFORMATION_PAGE);
  return { ok: true, message: response.data.message };
}

export async function updateUserAccountSettingsAction({
  userId,
  language,
  currency
}: {
  userId: number;
  language: string;
  currency: string;
}) {
  const response = await updateUserAccountSettings(userId, {
    language,
    currency
  });

  if (isResponseError(response)) {
    return {
      ok: false,
      message: response.data.message,
      validationErrors: mapValidationErrors(response.data.errors)
    };
  }

  await updateSessionAction({
    newSession: {
      language,
      currency: currency as Currency
    }
  });

  revalidatePath(ACCOUNT_SETTINGS_PAGE);
  return { ok: true, message: response.data.message };
}

export async function updateUserProfilePictureAction({
  userId,
  formData
}: {
  userId: number;
  formData: FormData;
}) {
  const response = await updateUserProfilePicture(userId, formData);

  if (isResponseError(response)) {
    return {
      ok: false,
      message: response.data.message
    };
  }

  revalidatePath('/profile', 'layout');
  return { ok: true, message: response.data.message };
}

export async function changeUserPasswordAction({
  userId,
  password,
  newPassword,
  confirmedNewPassword
}: {
  userId: number;
  password: string;
  newPassword: string;
  confirmedNewPassword: string;
}) {
  const response = await changeUserPassword({
    userId,
    password,
    newPassword,
    confirmedNewPassword
  });

  if (isResponseError(response)) {
    return {
      ok: false,
      message: response.data.message,
      validationErrors: mapValidationErrors(response.data.errors)
    };
  }

  revalidatePath(CHANGE_PASSWORD_PAGE);
  return { ok: true, message: response.data.message };
}
