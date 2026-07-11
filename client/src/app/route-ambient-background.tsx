'use client';

import { cn } from '@heroui/react';
import { usePathname } from 'next/navigation';

import {
  ACCOUNT_SETTINGS_PAGE,
  ADD_NEW_BANK_ACCOUNT_PAGE,
  BANKING_INFORMATION_PAGE,
  CHANGE_PASSWORD_PAGE,
  CLIENTS_PAGE,
  CREATE_INVOICE_PAGE,
  DASHBOARD_PAGE,
  EXPENSES_PAGE,
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

const AUTH_BACKGROUND_PATHS = [
  LOGIN_PAGE,
  SIGN_UP_PAGE,
  FORGOT_PASSWORD_PAGE,
  '/create-new-password',
  ONBOARDING_PAGE,
  DASHBOARD_PAGE,
  INVOICES_PAGE,
  EXPENSES_PAGE,
  CLIENTS_PAGE,
  PERSONAL_INFORMATION_PAGE,
  BANKING_INFORMATION_PAGE,
  ADD_NEW_BANK_ACCOUNT_PAGE,
  CHANGE_PASSWORD_PAGE,
  ACCOUNT_SETTINGS_PAGE,
  VERIFY_EMAIL_PAGE
] as const;

const HOME_BACKGROUND_PATHS = [
  HOME_PAGE,
  CREATE_INVOICE_PAGE,
  PRIVACY_POLICY_PAGE,
  TERMS_OF_SERVICE_PAGE
] as const;

const matchesPath = (pathname: string | null, path: string) =>
  pathname === path ||
  (path !== HOME_PAGE && !!pathname?.startsWith(`${path}/`));

export default function RouteAmbientBackground() {
  const pathname = usePathname();
  const isAuthBackground = AUTH_BACKGROUND_PATHS.some((path) =>
    matchesPath(pathname, path)
  );
  const isHomeBackground = HOME_BACKGROUND_PATHS.some((path) =>
    matchesPath(pathname, path)
  );

  return (
    <div className="bg-background pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className={cn(
          'text-accent absolute inset-0 transition-opacity duration-300 ease-out',
          isHomeBackground && !isAuthBackground ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div className="landing-glow-mint absolute left-1/2 top-[-14rem] h-[38rem] w-[62rem] -translate-x-1/2 rounded-full blur-2xl" />
        <div className="landing-grid-overlay text-muted absolute inset-0 dark:text-white" />
        <div className="from-background via-background/60 absolute inset-x-0 top-0 h-96 bg-gradient-to-b to-transparent dark:from-zinc-950 dark:via-zinc-950/60" />
      </div>

      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-300 ease-out',
          isAuthBackground ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div className="landing-glow-mint text-accent absolute left-1/2 top-[-20rem] h-[52rem] w-[86rem] -translate-x-1/2 rounded-full opacity-95 blur-3xl dark:opacity-55" />
        <div className="bg-accent/20 dark:bg-accent/15 absolute right-[-18rem] top-1/4 h-[36rem] w-[36rem] rounded-full blur-3xl" />
        <div className="bg-success/20 dark:bg-success/15 absolute bottom-[-20rem] left-[-14rem] h-[36rem] w-[36rem] rounded-full blur-3xl" />
        <div className="from-background/70 via-background/40 dark:from-background dark:via-background/75 absolute inset-x-0 top-0 h-72 bg-gradient-to-b to-transparent" />
        <div className="from-background/60 to-background/80 dark:from-background dark:to-background absolute inset-0 bg-gradient-to-b via-transparent" />
      </div>
    </div>
  );
}
