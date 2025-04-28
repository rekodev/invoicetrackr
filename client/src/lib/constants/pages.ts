export const LOGIN_PAGE = '/login';
export const SIGN_UP_PAGE = '/sign-up';
export const FORGOT_PASSWORD_PAGE = '/forgot-password';

export const HOME_PAGE = '/';
export const CREATE_INVOICE_PAGE = '/create-invoice';
export const DASHBOARD_PAGE = '/dashboard';
export const INVOICES_PAGE = '/invoices';
export const ADD_NEW_INVOICE_PAGE = '/invoices/new';
export const EDIT_INVOICE_PAGE = (invoiceId: number) =>
  `/invoices/edit/${invoiceId}`;
export const CONTRACTS_PAGE = '/contracts';
export const CLIENTS_PAGE = '/clients';
export const PERSONAL_INFORMATION_PAGE = '/profile/personal-information';
export const BANKING_INFORMATION_PAGE = '/profile/banking-information';
export const ADD_NEW_BANK_ACCOUNT_PAGE = '/profile/banking-information/new';
export const ONBOARDING_PAGE = '/onboarding';
export const PAYMENT_SUCCESS_PAGE = '/payment-success';

export const CHANGE_PASSWORD_PAGE = '/profile/change-password';
export const ACCOUNT_SETTINGS_PAGE = '/profile/account-settings';

export const PRIVACY_POLICY_PAGE = '/privacy-policy';
export const TERMS_OF_SERVICE_PAGE = '/terms-of-service';
