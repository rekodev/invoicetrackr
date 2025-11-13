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
    currency: Currency;
    type: string;
    businessType: string;
    businessNumber: string;
    selectedBankAccountId: number;
    address: string;
    email: string;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    isOnboarded?: boolean;
    isSubscriptionActive?: boolean;
  }

  interface Session {
    user: User & DefaultSession['user'];
    accessToken: string;
  }
}
