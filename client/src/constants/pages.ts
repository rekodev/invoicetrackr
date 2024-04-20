export const HOME_PAGE = '/';
export const INVOICES_PAGE = '/invoices';
export const ADD_NEW_INVOICE_PAGE = '/invoices/new';
export const EDIT_INVOICE_PAGE = (invoiceId: number) =>
  `/invoices/edit/${invoiceId}`;
export const CONTRACTS_PAGE = '/contracts';
export const CLIENTS_PAGE = '/clients';
export const PERSONAL_INFORMATION_PAGE = '/profile/personal-information';
export const BANKING_INFORMATION_PAGE = '/profile/banking-information';
export const CHANGE_PASSWORD_PAGE = '/profile/change-password';
export const ACCOUNT_SETTINGS_PAGE = '/profile/account-settings';
