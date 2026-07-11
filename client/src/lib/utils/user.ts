import { User } from '@invoicetrackr/types';

export function isUserPersonalInformationSetUp(user: Partial<User>) {
  if (
    user.name &&
    user.businessType &&
    user.businessNumber &&
    user.address &&
    user.invoiceEmail
  )
    return true;

  return false;
}

export function isUserBankingDetailsSetUp(user: Partial<User>) {
  return Boolean(user.selectedBankAccountId);
}
