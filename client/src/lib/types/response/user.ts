import { UserModel, ResetPasswordTokenModel } from '../models/user';

export type ActionResponseModel = {
  ok: boolean;
  message?: string;
  validationErrors?: Record<string, string>;
};

export type RegisterUserResponse = {
  email: string;
  message: string;
};

export type UpdateUserResp = {
  message: string;
  user: UserModel;
};

export type UpdateUserAccountSettingsResp = { message: string };

export type DeleteUserAccountResp = { message: string };

export type ResetPasswordResp = { message: string };

export type GetUserResetPasswordTokenResp = ResetPasswordTokenModel;

export type CreateNewPasswordResp = { message: string };
