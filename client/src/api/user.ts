import {
  CreateNewPasswordResponse,
  DeleteUserAccountResponse,
  GetUserResetPasswordTokenResponse,
  GetUserResponse,
  LoginUserResponse,
  RegisterUserResponse,
  ResetPasswordResponse,
  UpdateUserAccountSettingsResponse,
  UpdateUserResponse,
  User
} from '@invoicetrackr/types';

import api from './api-instance';

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

export const updateUser = async (
  id: number,
  userData: Pick<
    User,
    'email' | 'name' | 'businessType' | 'businessNumber' | 'address' | 'type'
  > & { signature: string | File | undefined }
) => {
  const isSignatureFile = typeof userData.signature !== 'string';

  return await api.put<UpdateUserResponse>(`/api/users/${id}`, userData, {
    headers: {
      'Content-Type': isSignatureFile
        ? 'multipart/form-data'
        : 'application/json'
    }
  });
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
  { language, currency }: { language: string; currency: string }
) =>
  await api.put<UpdateUserAccountSettingsResponse>(
    `/api/users/${userId}/account-settings`,
    {
      language,
      currency
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
