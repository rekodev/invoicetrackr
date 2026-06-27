import {
  CREATE_INVOICE_PAGE,
  HOME_PAGE,
  PRIVACY_POLICY_PAGE,
  TERMS_OF_SERVICE_PAGE
} from '@/lib/constants/pages';
import { appBaseUrl } from '@/lib/config/app';

export type SeoLocale = 'lt' | 'en';
export type SeoPage = 'home' | 'createInvoice' | 'privacyPolicy' | 'terms';

type SeoPageConfig = {
  pathname: string;
  priority: number;
};

export const siteName = 'InvoiceTrackr';
export const defaultSeoLocale: SeoLocale = 'lt';
export const seoLocales = ['lt', 'en'] as const satisfies SeoLocale[];

export const seoPages = {
  home: {
    pathname: HOME_PAGE,
    priority: 1
  },
  createInvoice: {
    pathname: CREATE_INVOICE_PAGE,
    priority: 0.9
  },
  privacyPolicy: {
    pathname: PRIVACY_POLICY_PAGE,
    priority: 0.35
  },
  terms: {
    pathname: TERMS_OF_SERVICE_PAGE,
    priority: 0.35
  }
} satisfies Record<SeoPage, SeoPageConfig>;

export const getSeoLocale = (locale: string | undefined): SeoLocale =>
  locale === 'lt' ? 'lt' : 'en';

export const getAbsoluteUrl = (pathname: string) =>
  new URL(pathname, appBaseUrl).toString();
