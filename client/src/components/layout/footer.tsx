'use client';

import { Link } from '@heroui/react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import {
  ACCOUNT_SETTINGS_PAGE,
  BANKING_INFORMATION_PAGE,
  CHANGE_PASSWORD_PAGE,
  CLIENTS_PAGE,
  CREATE_INVOICE_PAGE,
  DASHBOARD_PAGE,
  FORGOT_PASSWORD_PAGE,
  HOME_PAGE,
  INVOICES_PAGE,
  LOGIN_PAGE,
  ONBOARDING_PAGE,
  PERSONAL_INFORMATION_PAGE,
  PRIVACY_POLICY_PAGE,
  SIGN_UP_PAGE,
  TERMS_OF_SERVICE_PAGE,
  VERIFY_EMAIL_PAGE
} from '@/lib/constants/pages';

import AppBrand from '../app-brand';
import ContactFormDialog from './contact-form-dialog';

const CREATE_NEW_PASSWORD_PAGE = '/create-new-password';

const FULL_FOOTER_PATHNAMES = [
  HOME_PAGE,
  PRIVACY_POLICY_PAGE,
  TERMS_OF_SERVICE_PAGE,
  CREATE_INVOICE_PAGE,
  LOGIN_PAGE,
  ONBOARDING_PAGE,
  SIGN_UP_PAGE,
  FORGOT_PASSWORD_PAGE,
  CREATE_NEW_PASSWORD_PAGE
] as const;

const HIDDEN_FOOTER_PATH_PREFIXES = [
  DASHBOARD_PAGE,
  INVOICES_PAGE,
  CLIENTS_PAGE,
  PERSONAL_INFORMATION_PAGE,
  BANKING_INFORMATION_PAGE,
  CHANGE_PASSWORD_PAGE,
  ACCOUNT_SETTINGS_PAGE,
  VERIFY_EMAIL_PAGE
] as const;

const matchesPath = (pathname: string | null, path: string) =>
  pathname === path || !!pathname?.startsWith(`${path}/`);

const Footer = () => {
  const t = useTranslations('footer');
  const pathname = usePathname();
  const shouldHideFooter = HIDDEN_FOOTER_PATH_PREFIXES.some((path) =>
    matchesPath(pathname, path)
  );
  const shouldShowFullFooter = FULL_FOOTER_PATHNAMES.some((path) =>
    matchesPath(pathname, path)
  );

  if (shouldHideFooter) return null;

  return (
    <footer className="flex flex-col items-center justify-center">
      {shouldShowFullFooter && (
        <div className="border-t-1 w-full gap-4 py-10 md:flex-row md:gap-8 md:py-12">
          <div className="m-auto flex w-full max-w-7xl flex-col items-center justify-between gap-8 px-6 text-center sm:flex-row sm:items-start sm:text-start">
            <div className="flex flex-col gap-6">
              <AppBrand
                className="mx-auto sm:mx-0"
                wordmarkClassName="text-inherit"
              />
              <p className="text-muted-foreground text-sm">{t('tagline')}</p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 md:ml-auto">
              <div className="grid gap-3 text-sm">
                <div className="text-muted font-medium">{t('support')}</div>
                <ContactFormDialog />
              </div>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 md:ml-auto">
              <div className="grid gap-3 text-sm">
                <div className="text-muted font-medium">{t('legal')}</div>
                <nav className="grid gap-2">
                  <Link
                    href={PRIVACY_POLICY_PAGE}
                    className="text-foreground mx-auto text-sm hover:underline sm:mx-0"
                  >
                    {t('privacy_policy')}
                  </Link>
                  <Link
                    href={TERMS_OF_SERVICE_PAGE}
                    className="text-foreground text-sm hover:underline"
                  >
                    {t('terms_of_service')}
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="border-t-1 flex w-full flex-col gap-4 py-6 md:flex-row md:items-center">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-6">
          <div className="text-muted-foreground text-center text-xs">
            {t('copyright', { year: new Date().getFullYear() })}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
