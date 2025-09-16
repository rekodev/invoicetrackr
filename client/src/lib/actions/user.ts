'use server';

import { revalidatePath } from 'next/cache';

import {
  changeUserPassword,
  updateUser,
  updateUserAccountSettings,
  updateUserProfilePicture
} from '@/api';

import {
  CHANGE_PASSWORD_PAGE,
  PERSONAL_INFORMATION_PAGE
} from '../constants/pages';
import { UserModel } from '../types/models/user';
import { ActionResponseModel } from '../types/response';
import { isResponseError } from '../utils/error';
import { mapValidationErrors } from '../utils/validation';

export async function updateUserAction({
  user,
  signature
}: {
  user: UserModel;
  signature: string | File | undefined;
}): Promise<ActionResponseModel | Error> {
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
      message: response.data.message
    };
  }

  revalidatePath(PERSONAL_INFORMATION_PAGE);
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
  language,
  password,
  newPassword,
  confirmedNewPassword
}: {
  userId: number;
  language: string;
  password: string;
  newPassword: string;
  confirmedNewPassword: string;
}) {
  const response = await changeUserPassword({
    userId,
    language,
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
