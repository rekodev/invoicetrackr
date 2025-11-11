import {
  CreateNewPasswordResp,
  DeleteUserAccountResp,
  GetUserResetPasswordTokenResp,
  GetUserResp,
  LoginUserResp,
  RegisterUserResponse,
  ResetPasswordResp,
  UpdateUserAccountSettingsResp,
  UpdateUserResp
} from '@/lib/types/response';
import { UserModel, UserModelWithPassword } from '@/lib/types/models/user';

import api from './api-instance';

export const registerUser = async ({
  email,
  password,
  confirmedPassword
}: Pick<UserModelWithPassword, 'email' | 'password'> & {
  confirmedPassword: string;
}) =>
  await api.post<RegisterUserResponse>('/api/users', {
    email,
    password,
    confirmedPassword
  });

export const getUser = async (id: number) =>
  await api.get<GetUserResp>(`/api/users/${id}`);

export const loginUser = async (email: string, password: string) =>
  await api.post<LoginUserResp>('/api/users/login', {
    email,
    password
  });

export const updateUser = async (id: number, userData: UserModel) => {
  const isSignatureFile = typeof userData.signature !== 'string';

  return await api.put<UpdateUserResp>(`/api/users/${id}`, userData, {
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
  await api.put<UpdateUserResp>(`/api/users/${userId}/selected-bank-account`, {
    selectedBankAccountId
  });

export const updateUserProfilePicture = async (
  userId: number,
  formData: FormData
) =>
  await api.put<UpdateUserResp>(
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
  await api.put<UpdateUserAccountSettingsResp>(
    `/api/users/${userId}/account-settings`,
    {
      language,
      currency
    }
  );

export const deleteUserAccount = async (userId: number) =>
  await api.delete<DeleteUserAccountResp>(`/api/users/${userId}`);

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
  await api.put<UpdateUserResp>(
    `/api/users/${userId}/change-password`,
    { password, newPassword, confirmedNewPassword }
  );

export const resetUserPassword = async ({ email }: { email: string }) =>
  await api.post<ResetPasswordResp>(`/api/forgot-password`, { email });

export const getUserResetPasswordToken = async (token: string) =>
  await api.get<GetUserResetPasswordTokenResp>(
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
  await api.put<CreateNewPasswordResp>(
    `/api/users/${userId}/create-new-password`,
    {
      newPassword,
      confirmedNewPassword,
      token
    }
  );
