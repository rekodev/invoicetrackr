import { ACCOUNT_SETTINGS_PAGE } from '../constants/pages';

export const accountDataExportHref = `${ACCOUNT_SETTINGS_PAGE}/export`;

export const accountDataExportErrorHref = `${ACCOUNT_SETTINGS_PAGE}?export_error=1`;

export const matchesAccountEmail = (typed: string, email: string) =>
  typed.trim().toLowerCase() === email.trim().toLowerCase();
