'use client';

import { Link } from '@heroui/react';
import { usePathname } from 'next/navigation';

import {
  CHANGE_PASSWORD_PAGE,
  CREATE_INVOICE_PAGE,
  FORGOT_PASSWORD_PAGE,
  HOME_PAGE,
  LOGIN_PAGE,
  PRIVACY_POLICY_PAGE,
  TERMS_OF_SERVICE_PAGE
} from '@/lib/constants/pages';

import AppLogo from './icons/AppLogo';

const FULL_FOOTER_PATHNAMES = [
  HOME_PAGE,
  PRIVACY_POLICY_PAGE,
  TERMS_OF_SERVICE_PAGE,
  CREATE_INVOICE_PAGE,
  LOGIN_PAGE,
  SIGN_UP_PAGE,
  FORGOT_PASSWORD_PAGE,
  CHANGE_PASSWORD_PAGE
];

const Footer = () => {
  const pathname = usePathname();

  return (
    <footer className="flex flex-col items-center justify-center">
      {FULL_FOOTER_PATHNAMES.some(
        (name) => pathname && name.includes(pathname)
      ) && (
        <div className="border-t-1 border-default-300 dark:border-default-100 w-full gap-4 py-10 md:flex-row md:gap-8 md:py-12">
          <div className="m-auto flex w-full max-w-7xl flex-col items-center justify-between gap-8 px-6 text-center sm:flex-row sm:text-start">
            <div className="flex flex-col gap-6">
              <div className="mx-auto flex items-center gap-2 sm:mx-0">
                <AppLogo />
                <p className="font-bold text-inherit">
                  INVOICE<span className="text-secondary-600">TRACKR</span>
                </p>
              </div>
              <p className="text-muted-foreground text-sm">
                Simple, powerful invoicing for freelancers and small businesses.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 md:ml-auto">
              <div className="grid gap-3 text-sm">
                <div className="font-medium">Legal</div>
                <nav className="grid gap-2">
                  <Link
                    color="foreground"
                    href={PRIVACY_POLICY_PAGE}
                    className="text-sm hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    color="foreground"
                    href={TERMS_OF_SERVICE_PAGE}
                    className="text-sm hover:underline"
                  >
                    Terms of Service
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="border-t-1 border-t-default-300 dark:border-t-default-100 flex w-full flex-col gap-4 py-6 md:flex-row md:items-center">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-6">
          <div className="text-muted-foreground text-center text-xs">
            © {new Date().getFullYear()} InvoiceTrackr. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
