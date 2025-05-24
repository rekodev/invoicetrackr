import type { NextAuthConfig } from 'next-auth';

import {
  DASHBOARD_PAGE,
  ONBOARDING_PAGE,
  RENEW_SUBSCRIPTION_PAGE
} from './lib/constants/pages';
import { Currency } from './lib/types/currency';

export const authConfig = {
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const publicPaths = [
        '/login',
        '/sign-up',
        '/forgot-password',
        '/',
        '/create-invoice',
        '/privacy-policy',
        '/terms-of-service'
      ];
      const path = nextUrl.pathname;
      const pathIsPublic =
        publicPaths.includes(path) || path.startsWith('/create-new-password');

      const isOnboarded = !!auth?.user?.isOnboarded;
      const isSubscriptionActive = !!auth?.user?.isSubscriptionActive;
      const isOnboardingPage = path.startsWith(ONBOARDING_PAGE);
      const isRenewPage = path.startsWith(RENEW_SUBSCRIPTION_PAGE);

      if (!pathIsPublic) {
        if (!isLoggedIn) return false;

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

      // Logged in but accessing public path → send to dashboard
      if (isLoggedIn) {
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
        token.currency = user.currency;
        token.isOnboarded = isOnboarded;
        token.isSubscriptionActive = user.isSubscriptionActive;
      }

      if (trigger === 'update') {
        token = {
          ...token,
          isOnboarded: session.user.isOnboarded,
          language: session.user.language,
          currency: session.user.currency,
          isSubscriptionActive: session.user.isSubscriptionActive
        };
      }

      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub!;
      session.user.language = token.language as string;
      session.user.currency = token.currency as Currency;
      session.user.isOnboarded = Boolean(token.isOnboarded);
      session.user.isSubscriptionActive = Boolean(token.isSubscriptionActive);

      return session;
    }
  },
  session: {},
  providers: [] // Add providers with an empty array for now
} satisfies NextAuthConfig;
