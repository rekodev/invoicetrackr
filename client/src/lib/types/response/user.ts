import { User, ResetPasswordToken } from '@invoicetrackr/types';

export type LoginUserResp = {
  user: User;
  message: string;
};

export type GetUserResp = {
  user: User;
};

export type RegisterUserResponse = {
  email: string;
  message: string;
};

export type UpdateUserResp = {
  message: string;
  user: User;
};

export type UpdateUserAccountSettingsResp = { message: string };

export type DeleteUserAccountResp = { message: string };

export type ResetPasswordResp = { message: string };

export type GetUserResetPasswordTokenResp = ResetPasswordToken;

export type CreateNewPasswordResp = { message: string };
