import type {
  BillingInterval,
  StripeSubscriptionStatus
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
    hasPaymentMethod?: boolean;
    billingDetails?: {
      name?: string | null;
      email?: string | null;
      cardBrand?: string | null;
      cardLast4?: string | null;
      cardExpMonth?: number | null;
      cardExpYear?: number | null;
    };
    isOnboarded?: boolean;
    subscriptionStatus?: StripeSubscriptionStatus | null;
    billingInterval?: BillingInterval | null;
    billingRate?: {
      amount?: number | null;
      currency?: string | null;
      interval?: string | null;
      intervalCount?: number | null;
    };
    onboardingCompletedAt?: string | null;
    trialStartedAt?: string | null;
    trialEndsAt?: string | null;
    subscriptionGraceEndsAt?: string | null;
    subscriptionCurrentPeriodEndsAt?: string | null;
    subscriptionCancelAt?: string | null;
  }

  // eslint-disable-next-line no-unused-vars
  interface Session {
    user: User & DefaultSession['user'];
    accessToken: string;
  }
}
