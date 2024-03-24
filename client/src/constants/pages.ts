export const HOME_PAGE = '/';
export const INVOICES_PAGE = '/invoices';
export const ADD_NEW_INVOICE_PAGE = '/invoices/new';
export const EDIT_INVOICE_PAGE = (invoiceId: number) =>
  `/invoices/edit/${invoiceId}`;
export const CONTRACTS_PAGE = '/contracts';
export const CLIENTS_PAGE = '/clients';
