export const LOGIN_PAGE = '/login';
export const SIGN_UP_PAGE = '/sign-up';
export const FORGOT_PASSWORD_PAGE = '/forgot-password';
export const VERIFY_EMAIL_PAGE = '/verify-email';

export const HOME_PAGE = '/';
export const CREATE_INVOICE_PAGE = '/create-invoice';
export const DASHBOARD_PAGE = '/dashboard';
export const INVOICES_PAGE = '/invoices';
export const ADD_NEW_INVOICE_PAGE = '/invoices/new';
export const EDIT_INVOICE_PAGE = (invoiceId: number) =>
  `/invoices/edit/${invoiceId}`;
export const CLIENTS_PAGE = '/clients';
export const EXPENSES_PAGE = '/expenses';
export const PAYMENTS_PAGE = '/payments';
export const REPORTS_PAGE = '/reports';
export const SETTINGS_PAGE = '/settings';
export const FREELANCER_PROFILE_PAGE = '/settings/freelancer-profile';
export const PAYMENT_METHODS_PAGE = '/settings/payment-methods';
export const ADD_NEW_BANK_ACCOUNT_PAGE = '/settings/payment-methods/new';
export const ONBOARDING_PAGE = '/onboarding';

export const CHANGE_PASSWORD_PAGE = '/settings/change-password';
export const ACCOUNT_SETTINGS_PAGE = '/settings/account-settings';

export const PRIVACY_POLICY_PAGE = '/privacy-policy';
export const TERMS_OF_SERVICE_PAGE = '/terms-of-service';
