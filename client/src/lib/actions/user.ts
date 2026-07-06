'use server';

import { revalidatePath } from 'next/cache';

import {
  changeUserPassword,
  resendVerificationEmail,
  updateUser,
  updateUserAccountSettings,
  updateUserProfilePicture,
  verifyEmailToken
} from '@/api/user';

import {
  ACCOUNT_SETTINGS_PAGE,
  CHANGE_PASSWORD_PAGE,
  PERSONAL_INFORMATION_PAGE,
  PROFILE_PAGE
} from '../constants/pages';
import {
  type AccountSettingsBody,
  DEFAULT_CURRENCY,
  User,
  VerifyEmailResponse
} from '@invoicetrackr/types';
import { ActionResponseModel } from '../types/action';
import { isResponseError } from '../utils/error';
import { mapValidationErrors } from '../utils/validation';
import { updateSessionAction } from '../actions';

type VerifyEmailTokenActionResponse =
  | {
      ok: false;
      message: string;
    }
  | ({
      ok: true;
    } & Pick<VerifyEmailResponse, 'emailVerifiedAt' | 'message' | 'status'>);

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

  await updateSessionAction({
    newSession: {
      isOnboarded: true,
      onboardingCompletedAt: new Date().toISOString(),
      isVatPayer: user.isVatPayer,
      vatNumber: user.isVatPayer ? user.vatNumber : null,
      ...(user.isVatPayer ? {} : { defaultInvoiceVatMode: 'no_vat' })
    }
  });

  revalidatePath(PERSONAL_INFORMATION_PAGE);
  revalidatePath(ACCOUNT_SETTINGS_PAGE);
  revalidatePath(PROFILE_PAGE, 'layout');
  return { ok: true, message: response.data.message };
}

export async function updateUserAccountSettingsAction({
  userId,
  language,
  preferredInvoiceLanguage,
  isVatPayer,
  defaultInvoiceVatMode,
  defaultInvoiceSeries,
  defaultPaymentTermsDays
}: {
  userId: number;
  language: AccountSettingsBody['language'];
  preferredInvoiceLanguage?: AccountSettingsBody['preferredInvoiceLanguage'];
  isVatPayer: AccountSettingsBody['isVatPayer'];
  defaultInvoiceVatMode: AccountSettingsBody['defaultInvoiceVatMode'];
  defaultInvoiceSeries: AccountSettingsBody['defaultInvoiceSeries'];
  defaultPaymentTermsDays: AccountSettingsBody['defaultPaymentTermsDays'];
}) {
  const normalizedDefaultInvoiceVatMode = isVatPayer
    ? defaultInvoiceVatMode
    : 'no_vat';

  const response = await updateUserAccountSettings(userId, {
    language,
    currency: DEFAULT_CURRENCY,
    preferredInvoiceLanguage,
    isVatPayer,
    defaultInvoiceVatMode: normalizedDefaultInvoiceVatMode,
    defaultInvoiceSeries,
    defaultPaymentTermsDays
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
      preferredInvoiceLanguage,
      currency: DEFAULT_CURRENCY,
      isVatPayer,
      defaultInvoiceVatMode: normalizedDefaultInvoiceVatMode,
      defaultInvoiceSeries,
      defaultPaymentTermsDays
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

export async function resendVerificationEmailAction({
  userId
}: {
  userId: number;
}) {
  const response = await resendVerificationEmail(userId);

  if (isResponseError(response)) {
    return {
      ok: false,
      message: response.data.message
    };
  }

  return { ok: true, message: response.data.message };
}

export async function verifyEmailTokenAction({
  token,
  shouldSyncSession = false
}: {
  token: string;
  shouldSyncSession?: boolean;
}): Promise<VerifyEmailTokenActionResponse> {
  const response = await verifyEmailToken(token);

  if (isResponseError(response)) {
    return {
      ok: false,
      message: response.data.message
    };
  }

  if (response.data.emailVerifiedAt && shouldSyncSession) {
    await updateSessionAction({
      newSession: {
        emailVerifiedAt: response.data.emailVerifiedAt
      }
    });
  }

  return {
    ok: true,
    message: response.data.message,
    status: response.data.status,
    emailVerifiedAt: response.data.emailVerifiedAt
  };
}
