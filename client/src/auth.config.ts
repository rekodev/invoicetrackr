import type { NextAuthConfig } from 'next-auth';

import { DASHBOARD_PAGE, ONBOARDING_PAGE } from './lib/constants/pages';

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
      const pathIsPublic =
        publicPaths.includes(nextUrl.pathname) ||
        nextUrl.pathname.startsWith('/create-new-password');
      const isOnboarded = !!auth?.user.isOnboarded;
      const pathIsOnboarding = nextUrl.pathname.startsWith(ONBOARDING_PAGE);

      if (!pathIsPublic) {
        if (isLoggedIn) {
          if (isOnboarded) {
            return pathIsOnboarding
              ? Response.redirect(new URL(DASHBOARD_PAGE, nextUrl))
              : true;
          } else {
            return pathIsOnboarding
              ? true
              : Response.redirect(new URL('/onboarding', nextUrl));
          }
        }

        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      return true;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        let isOnboarded = false;

        if (
          user.name &&
          user.businessType &&
          user.businessNumber &&
          user.address &&
          user.selectedBankAccountId
        ) {
          isOnboarded = true;
        }

        token.language = user.language;
        token.currency = user.currency;
        token.isOnboarded = isOnboarded;
      }

      if (trigger === 'update') {
        token = {
          ...token,
          language: session.user.language,
          currency: session.user.currency
        };
      }

      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub!;
      session.user.language = token.language as string;
      session.user.currency = token.currency as string;
      session.user.isOnboarded = Boolean(token.isOnboarded);

      return session;
    }
  },
  session: {},
  providers: [] // Add providers with an empty array for now
} satisfies NextAuthConfig;
