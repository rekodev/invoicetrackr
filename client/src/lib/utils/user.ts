import { DefaultInvoiceVatMode, User } from '@invoicetrackr/types';

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

export const getInvoiceDefaultsValues = (user: User) => {
  const isVatPayer = Boolean(user.isVatPayer);

  return {
    invoiceEmail: user.invoiceEmail || user.email || '',
    preferredInvoiceLanguage: user.preferredInvoiceLanguage || user.language,
    defaultInvoiceVatMode: (isVatPayer
      ? user.defaultInvoiceVatMode || 'no_vat'
      : 'no_vat') as DefaultInvoiceVatMode,
    defaultInvoiceSeries: user.defaultInvoiceSeries || 'SF',
    defaultPaymentTermsDays: (user.defaultPaymentTermsDays || 30) as
      | 7
      | 14
      | 30,
    defaultInvoiceIncludeLogo: user.defaultInvoiceIncludeLogo ?? true
  };
};
