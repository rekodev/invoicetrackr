import { UserModel } from '../types/models/user';

export function isUserPersonalInformationSetUp(user: Partial<UserModel>) {
  if (
    user.name &&
    user.businessType &&
    user.businessNumber &&
    user.address &&
    user.email
  )
    return true;

  return false;
}

export function isUserBankingDetailsSetUp(user: Partial<UserModel>) {
  return Boolean(user.selectedBankAccountId);
}
