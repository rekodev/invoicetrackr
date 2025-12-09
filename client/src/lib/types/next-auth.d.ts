import { DefaultSession } from 'next-auth';
import { StripeSubscriptionStatus } from '@invoicetrackr/types';

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
    currency: Currency;
    type: string;
    businessType: string;
    businessNumber: string;
    vatNumber: string | null | undefined;
    selectedBankAccountId: number;
    address: string;
    email: string;
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
    isOnboarded?: boolean;
    subscriptionStatus?: StripeSubscriptionStatus | null;
  }

  // eslint-disable-next-line no-unused-vars
  interface Session {
    user: User & DefaultSession['user'];
    accessToken: string;
  }
}
