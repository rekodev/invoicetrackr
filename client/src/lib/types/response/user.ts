import {
  ResetPasswordTokenModel,
  UserModel,
  UserModelWithPassword
} from '../models/user';

export type LoginUserResp = {
  user: UserModelWithPassword;
  message: string;
};

export type GetUserResp = {
  user: UserModel;
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
