import { loadEnv } from './env';

loadEnv();

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export const getAppBaseUrl = () =>
  trimTrailingSlash(
    process.env.APP_BASE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      'http://localhost:3000'
  );

export const appEmailFrom =
  process.env.RESEND_FROM_EMAIL || 'InvoiceTrackr <noreply@invoicetrackr.app>';

export const getAppUrl = (path: string) =>
  `${getAppBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
