import type { AnalyticsConsentStatus } from '@invoicetrackr/types';
import { DefaultSession } from 'next-auth';

import { Currency } from './currency';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface User {
    id: string;
    name: string;
    email: string;
    language: string;
    preferredInvoiceLanguage: string;
    isVatPayer: boolean;
    currency: Currency;
    selectedBankAccountId: number;
    emailVerifiedAt?: string | null;
    isOnboarded?: boolean;
    analyticsConsentStatus?: AnalyticsConsentStatus | null;
  }

  // eslint-disable-next-line no-unused-vars
  interface Session {
    user: User & DefaultSession['user'];
  }
}
