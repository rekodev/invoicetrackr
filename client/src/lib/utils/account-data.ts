import { ACCOUNT_PAGE } from '../constants/pages';

export const accountDataExportHref = `${ACCOUNT_PAGE}/export`;

export const accountDataExportErrorHref = `${ACCOUNT_PAGE}?export_error=1`;

export const matchesAccountEmail = (typed: string, email: string) =>
  typed.trim().toLowerCase() === email.trim().toLowerCase();
