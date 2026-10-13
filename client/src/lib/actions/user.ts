'use server';

import {
  type AccountSettingsBody,
  DEFAULT_CURRENCY,
  type DeleteUserAccountBody,
  User,
  type UserLanguageBody,
  VerifyEmailResponse
} from '@invoicetrackr/types';
import { revalidatePath } from 'next/cache';

import {
  changeUserPassword,
  completeUserOnboarding,
  deleteUserAccount,
  deleteUserProfilePicture,
  resendVerificationEmail,
  updateUser,
  updateUserAccountSettings,
  updateUserLanguage,
  updateUserProfilePicture,
  verifyEmailToken
} from '@/api/user';

import { updateSessionAction } from '../actions';
import {
  ACCOUNT_PAGE,
  CHANGE_PASSWORD_PAGE,
  INVOICE_DEFAULTS_PAGE,
  ONBOARDING_PAGE,
  PROFILE_PAGE} from '../constants/pages';
import { ActionResponseModel } from '../types/action';
import { isResponseError } from '../utils/error';
import { mapValidationErrors } from '../utils/validation';

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
    newSession: { isVatPayer: user.isVatPayer }
  });

  revalidatePath(PROFILE_PAGE);
  revalidatePath(INVOICE_DEFAULTS_PAGE);
  return { ok: true, message: response.data.message };
}

export async function completeUserOnboardingAction({
  userId
}: {
  userId: number;
}): Promise<ActionResponseModel> {
  const response = await completeUserOnboarding(userId);

  if (isResponseError(response)) {
    return {
      ok: false,
      message: response.data.message,
      validationErrors: mapValidationErrors(response.data.errors)
    };
  }

  await updateSessionAction({
    newSession: { isOnboarded: true }
  });

  revalidatePath(ONBOARDING_PAGE);
  return {
    ok: true,
    message: response.data.message,
    data: response.data.user
  };
}

export async function updateUserAccountSettingsAction({
  userId,
  invoiceEmail,
  preferredInvoiceLanguage,
  isVatPayer,
  defaultInvoiceVatMode,
  defaultInvoiceSeries,
  defaultPaymentTermsDays,
  defaultInvoiceIncludeLogo
}: {
  userId: number;
  invoiceEmail: AccountSettingsBody['invoiceEmail'];
  preferredInvoiceLanguage?: AccountSettingsBody['preferredInvoiceLanguage'];
  isVatPayer: AccountSettingsBody['isVatPayer'];
  defaultInvoiceVatMode: AccountSettingsBody['defaultInvoiceVatMode'];
  defaultInvoiceSeries: AccountSettingsBody['defaultInvoiceSeries'];
  defaultPaymentTermsDays: AccountSettingsBody['defaultPaymentTermsDays'];
  defaultInvoiceIncludeLogo: AccountSettingsBody['defaultInvoiceIncludeLogo'];
}) {
  const normalizedDefaultInvoiceVatMode = isVatPayer
    ? defaultInvoiceVatMode
    : 'no_vat';

  const response = await updateUserAccountSettings(userId, {
    invoiceEmail,
    currency: DEFAULT_CURRENCY,
    preferredInvoiceLanguage,
    isVatPayer,
    defaultInvoiceVatMode: normalizedDefaultInvoiceVatMode,
    defaultInvoiceSeries,
    defaultPaymentTermsDays,
    defaultInvoiceIncludeLogo
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
      preferredInvoiceLanguage,
      currency: DEFAULT_CURRENCY,
      isVatPayer
    }
  });

  revalidatePath(INVOICE_DEFAULTS_PAGE);
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

  await updateSessionAction({
    newSession: { image: response.data.user.profilePictureUrl }
  });
  revalidatePath(PROFILE_PAGE);
  return {
    ok: true,
    message: response.data.message,
    data: response.data.user
  };
}

export async function deleteUserProfilePictureAction({
  userId
}: {
  userId: number;
}) {
  const response = await deleteUserProfilePicture(userId);

  if (isResponseError(response)) {
    return { ok: false, message: response.data.message };
  }

  await updateSessionAction({ newSession: { image: null } });
  revalidatePath(PROFILE_PAGE);

  return {
    ok: true,
    message: response.data.message,
    data: response.data.user
  };
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

export async function updateUserLanguageAction({
  userId,
  language
}: { userId: number } & UserLanguageBody): Promise<ActionResponseModel> {
  const response = await updateUserLanguage(userId, { language });

  if (isResponseError(response)) {
    return {
      ok: false,
      message: response.data.message,
      validationErrors: mapValidationErrors(response.data.errors)
    };
  }

  await updateSessionAction({ newSession: { language } });
  revalidatePath(ACCOUNT_PAGE);
  return { ok: true, message: response.data.message };
}

export async function deleteUserAccountAction({
  userId,
  confirmEmail
}: { userId: number } & DeleteUserAccountBody): Promise<ActionResponseModel> {
  const response = await deleteUserAccount(userId, { confirmEmail });

  if (isResponseError(response)) {
    return {
      ok: false,
      message: response.data.message,
      validationErrors: mapValidationErrors(response.data.errors)
    };
  }

  return { ok: true, message: response.data.message };
}
