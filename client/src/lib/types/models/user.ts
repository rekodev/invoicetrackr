import type { BankAccount, User } from '@invoicetrackr/types';

export type UserModel = User;
export type UserModelWithPassword = User;
export type BankingInformationModel = BankAccount;
export type BankingInformationFormModel = BankAccount;
export type AccountSettingsFormModel = Pick<User, 'currency' | 'language'>;

export type ChangePasswordFormModel = {
  password: string;
  newPassword: string;
  confirmedNewPassword: string;
};

export type ResetPasswordTokenModel = {
  id: number;
  userId: number;
  token: string;
  expiresAt: string;
  createdAt: string;
};

export type {
  User,
  UserGet,
  BankAccount,
  BankAccountGet
} from '@invoicetrackr/types';
