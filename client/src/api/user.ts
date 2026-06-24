import {
  CreateNewPasswordResponse,
  DeleteUserAccountResponse,
  GetUserResetPasswordTokenResponse,
  GetUserResponse,
  LoginUserResponse,
  OAuthUserResponse,
  RegisterUserResponse,
  ResendVerificationEmailResponse,
  ResetPasswordResponse,
  UpdateUserAccountSettingsResponse,
  UpdateUserResponse,
  User,
  VerifyEmailTokenResponse
} from '@invoicetrackr/types';

import api from './api-instance';
import { buildFormData } from '@/lib/utils/multipart';

export const registerUser = async ({
  email,
  password,
  confirmedPassword
}: {
  email: string;
  password: string;
  confirmedPassword: string;
}) =>
  await api.post<RegisterUserResponse>('/api/users', {
    email,
    password,
    confirmedPassword
  });

export const getUser = async (id: number) =>
  await api.get<GetUserResponse>(`/api/users/${id}`);

export const loginUser = async (email: string, password: string) =>
  await api.post<LoginUserResponse>('/api/users/login', {
    email,
    password
  });

export const upsertGoogleOAuthUser = async ({
  email,
  name,
  image,
  emailVerified
}: {
  email: string;
  name?: string | null;
  image?: string | null;
  emailVerified: boolean;
}) =>
  await api.post<OAuthUserResponse>('/api/users/oauth/google', {
    email,
    name: name || undefined,
    image: image || undefined,
    provider: 'google',
    emailVerified
  });

export const updateUser = async (
  id: number,
  userData: Pick<
    User,
    | 'email'
    | 'name'
    | 'businessType'
    | 'businessNumber'
    | 'vatNumber'
    | 'address'
    | 'type'
  > & { signature: string | File | undefined }
) => {
  if (typeof File !== 'undefined' && userData.signature instanceof File) {
    const { signature, ...dataWithoutFile } = userData;
    const formData = buildFormData(dataWithoutFile);
    formData.append('file', signature);

    return await api.put<UpdateUserResponse>(`/api/users/${id}`, formData);
  }

  return await api.put<UpdateUserResponse>(`/api/users/${id}`, userData);
};

export const updateUserSelectedBankAccount = async (
  userId: number,
  selectedBankAccountId: number
) =>
  await api.put<UpdateUserResponse>(
    `/api/users/${userId}/selected-bank-account`,
    {
      selectedBankAccountId
    }
  );

export const updateUserProfilePicture = async (
  userId: number,
  formData: FormData
) =>
  await api.put<UpdateUserResponse>(
    `/api/users/${userId}/profile-picture`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
  );

export const updateUserAccountSettings = async (
  userId: number,
  {
    language,
    currency,
    preferredInvoiceLanguage
  }: { language: string; currency: string; preferredInvoiceLanguage?: string }
) =>
  await api.put<UpdateUserAccountSettingsResponse>(
    `/api/users/${userId}/account-settings`,
    {
      language,
      currency,
      preferredInvoiceLanguage
    }
  );

export const deleteUserAccount = async (userId: number) =>
  await api.delete<DeleteUserAccountResponse>(`/api/users/${userId}`);

export const changeUserPassword = async ({
  userId,
  password,
  newPassword,
  confirmedNewPassword
}: {
  userId: number;
  password: string;
  newPassword: string;
  confirmedNewPassword: string;
}) =>
  await api.put<UpdateUserResponse>(`/api/users/${userId}/change-password`, {
    password,
    newPassword,
    confirmedNewPassword
  });

export const resetUserPassword = async ({ email }: { email: string }) =>
  await api.post<ResetPasswordResponse>(`/api/forgot-password`, { email });

export const getUserResetPasswordToken = async (token: string) =>
  await api.get<GetUserResetPasswordTokenResponse>(
    `/api/reset-password-token/${token}`
  );

export const createNewUserPassword = async ({
  userId,
  newPassword,
  confirmedNewPassword,
  token
}: {
  userId: number;
  newPassword: string;
  confirmedNewPassword: string;
  token: string;
}) =>
  await api.put<CreateNewPasswordResponse>(
    `/api/users/${userId}/create-new-password`,
    {
      newPassword,
      confirmedNewPassword,
      token
    }
  );

export const verifyEmailToken = async (token: string) =>
  await api.post<VerifyEmailTokenResponse>(`/api/email-verification/${token}`);

export const resendVerificationEmail = async (userId: number) =>
  await api.post<ResendVerificationEmailResponse>(
    `/api/users/${userId}/email-verification/resend`
  );
