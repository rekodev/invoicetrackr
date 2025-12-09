import type { NextAuthConfig } from 'next-auth';

import {
  CREATE_INVOICE_PAGE,
  DASHBOARD_PAGE,
  FORGOT_PASSWORD_PAGE,
  HOME_PAGE,
  LOGIN_PAGE,
  ONBOARDING_PAGE,
  PRIVACY_POLICY_PAGE,
  RENEW_SUBSCRIPTION_PAGE,
  SIGN_UP_PAGE,
  TERMS_OF_SERVICE_PAGE
} from './lib/constants/pages';
import { Currency } from './lib/types/currency';
import { hasActiveSubscription } from './lib/utils/subscription';

export const authConfig = {
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const sharedPaths = [PRIVACY_POLICY_PAGE, TERMS_OF_SERVICE_PAGE];
      const publicPaths = [
        ...sharedPaths,
        LOGIN_PAGE,
        SIGN_UP_PAGE,
        FORGOT_PASSWORD_PAGE,
        HOME_PAGE,
        CREATE_INVOICE_PAGE,
        PRIVACY_POLICY_PAGE,
        TERMS_OF_SERVICE_PAGE
      ];
      const path = nextUrl.pathname;
      const pathIsPublic =
        publicPaths.includes(path) || path.startsWith('/create-new-password');

      const isOnboarded = !!auth?.user?.isOnboarded;
      const isSubscriptionActive = hasActiveSubscription(auth?.user);
      const isOnboardingPage = path.startsWith(ONBOARDING_PAGE);
      const isRenewPage = path.startsWith(RENEW_SUBSCRIPTION_PAGE);

      if (!pathIsPublic) {
        if (!isLoggedIn) return Response.redirect(new URL(LOGIN_PAGE, nextUrl));

        // Not onboarded → allow onboarding page, redirect elsewhere
        if (!isOnboarded) {
          return isOnboardingPage
            ? true
            : Response.redirect(new URL(ONBOARDING_PAGE, nextUrl));
        }

        // Onboarded but subscription inactive → redirect unless already on renew page
        if (!isSubscriptionActive) {
          return isRenewPage || path.startsWith('/profile')
            ? true
            : Response.redirect(new URL(RENEW_SUBSCRIPTION_PAGE, nextUrl));
        }

        // Onboarded + active sub → redirect away from onboarding
        if (isOnboardingPage || isRenewPage) {
          return Response.redirect(new URL(DASHBOARD_PAGE, nextUrl));
        }

        return true;
      }

      // Logged in but accessing public path → send to dashboard (except shared paths)
      if (isLoggedIn && !sharedPaths.includes(path)) {
        return Response.redirect(new URL(DASHBOARD_PAGE, nextUrl));
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        let isOnboarded = false;

        if (
          user.name &&
          user.businessType &&
          user.businessNumber &&
          user.address &&
          user.selectedBankAccountId &&
          user.stripeCustomerId &&
          user.stripeSubscriptionId
        ) {
          isOnboarded = true;
        }

        token.language = user.language;
        token.preferredInvoiceLanguage = user.preferredInvoiceLanguage;
        token.currency = user.currency;
        token.isOnboarded = isOnboarded;
        token.subscriptionStatus = user.subscriptionStatus;
        token.selectedBankAccountId = user.selectedBankAccountId;
        token.vatNumber = user.vatNumber;
      }

      if (trigger === 'update') {
        token = {
          ...token,
          isOnboarded: session.user.isOnboarded,
          language: session.user.language,
          preferredInvoiceLanguage: session.user.preferredInvoiceLanguage,
          currency: session.user.currency,
          subscriptionStatus: session.user.subscriptionStatus,
          selectedBankAccountId: session.user.selectedBankAccountId
        };
      }

      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub!;
      session.user.language = token.language as string;
      session.user.preferredInvoiceLanguage =
        token.preferredInvoiceLanguage as string;
      session.user.currency = token.currency as Currency;
      session.user.isOnboarded = Boolean(token.isOnboarded);
      session.user.subscriptionStatus = token.subscriptionStatus as string;
      session.user.selectedBankAccountId =
        token.selectedBankAccountId as number;

      return session;
    }
  },
  session: {},
  providers: []
} satisfies NextAuthConfig;
