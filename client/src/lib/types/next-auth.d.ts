import type {
  AnalyticsConsentStatus,
  DefaultInvoiceVatMode
} from '@invoicetrackr/types';
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
    defaultInvoiceVatMode: DefaultInvoiceVatMode;
    defaultInvoiceSeries: string;
    defaultPaymentTermsDays: 7 | 14 | 30;
    currency: Currency;
    type: string;
    businessType: string;
    businessNumber: string;
    vatNumber: string | null | undefined;
    selectedBankAccountId: number;
    address: string;
    emailVerifiedAt?: string | null;
    isOnboarded?: boolean;
    onboardingCompletedAt?: string | null;
    analyticsConsentStatus?: AnalyticsConsentStatus | null;
    analyticsConsentUpdatedAt?: string | null;
  }

  // eslint-disable-next-line no-unused-vars
  interface Session {
    user: User & DefaultSession['user'];
  }
}
