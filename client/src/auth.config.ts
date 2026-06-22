import type { NextAuthConfig } from 'next-auth';
import { StripeSubscriptionStatus } from '@invoicetrackr/types';

import {
  CREATE_INVOICE_PAGE,
  DASHBOARD_PAGE,
  FORGOT_PASSWORD_PAGE,
  HOME_PAGE,
  LOGIN_PAGE,
  ONBOARDING_PAGE,
  PAYMENT_SUCCESS_PAGE,
  PRIVACY_POLICY_PAGE,
  RENEW_SUBSCRIPTION_PAGE,
  SIGN_UP_PAGE,
  TERMS_OF_SERVICE_PAGE,
  VERIFY_EMAIL_PAGE
} from './lib/constants/pages';
import { Currency } from './lib/types/currency';

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
      const isPublicInvoiceSigningPage = path.startsWith('/invoices/sign/');
      const isEmailVerificationPage = path.startsWith(VERIFY_EMAIL_PAGE);
      const pathIsPublic =
        publicPaths.includes(path) ||
        path.startsWith('/create-new-password') ||
        isEmailVerificationPage ||
        isPublicInvoiceSigningPage;

      const isOnboarded = !!auth?.user?.isOnboarded;
      const hasGraceAccess =
        auth?.user?.subscriptionStatus === 'past_due' &&
        !!auth.user.subscriptionGraceEndsAt &&
        new Date(auth.user.subscriptionGraceEndsAt) > new Date();
      const isSubscriptionActive =
        auth?.user?.subscriptionStatus === 'active' ||
        auth?.user?.subscriptionStatus === 'trialing' ||
        hasGraceAccess;
      const hasStartedBilling =
        !!auth?.user?.trialStartedAt || !!auth?.user?.subscriptionStatus;
      const isOnboardingPage = path.startsWith(ONBOARDING_PAGE);
      const isPaymentSuccessPage = path.startsWith(PAYMENT_SUCCESS_PAGE);
      const isPaymentSuccessConfirmPage = path.startsWith(
        `${PAYMENT_SUCCESS_PAGE}/confirm`
      );
      const isConfirmedPaymentSuccessPage =
        path === PAYMENT_SUCCESS_PAGE &&
        nextUrl.searchParams.get('confirmed') === 'true' &&
        (nextUrl.searchParams.get('trial') === 'true' ||
          nextUrl.searchParams.get('checkout') === 'true');
      const isRenewPage = path.startsWith(RENEW_SUBSCRIPTION_PAGE);

      if (!pathIsPublic) {
        if (!isLoggedIn) return Response.redirect(new URL(LOGIN_PAGE, nextUrl));

        if (
          isPaymentSuccessPage &&
          !isPaymentSuccessConfirmPage &&
          !isConfirmedPaymentSuccessPage
        ) {
          return Response.redirect(new URL(DASHBOARD_PAGE, nextUrl));
        }

        // Not onboarded → allow onboarding page, redirect elsewhere
        if (!isOnboarded) {
          return isOnboardingPage || isPaymentSuccessConfirmPage
            ? true
            : Response.redirect(new URL(ONBOARDING_PAGE, nextUrl));
        }

        // Onboarded but subscription inactive → redirect unless already on renew page
        if (!isSubscriptionActive) {
          if (!hasStartedBilling) {
            return isOnboardingPage || isPaymentSuccessPage
              ? true
              : Response.redirect(new URL(ONBOARDING_PAGE, nextUrl));
          }

          return isRenewPage || isPaymentSuccessPage
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
      if (
        isLoggedIn &&
        !sharedPaths.includes(path) &&
        !isEmailVerificationPage &&
        !isPublicInvoiceSigningPage
      ) {
        return Response.redirect(new URL(DASHBOARD_PAGE, nextUrl));
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const isOnboarded = !!user.onboardingCompletedAt;

        token.language = user.language;
        token.emailVerifiedAt = user.emailVerifiedAt;
        token.preferredInvoiceLanguage = user.preferredInvoiceLanguage;
        token.currency = user.currency;
        token.hasPaymentMethod = user.hasPaymentMethod;
        token.isOnboarded = isOnboarded;
        token.subscriptionStatus = user.subscriptionStatus;
        token.onboardingCompletedAt = user.onboardingCompletedAt;
        token.trialStartedAt = user.trialStartedAt;
        token.trialEndsAt = user.trialEndsAt;
        token.subscriptionGraceEndsAt = user.subscriptionGraceEndsAt;
        token.subscriptionCurrentPeriodEndsAt =
          user.subscriptionCurrentPeriodEndsAt;
        token.subscriptionCancelAt = user.subscriptionCancelAt;
        token.selectedBankAccountId = user.selectedBankAccountId;
        token.vatNumber = user.vatNumber;
      }

      if (trigger === 'update') {
        token = {
          ...token,
          isOnboarded: session.user.isOnboarded,
          emailVerifiedAt: session.user.emailVerifiedAt,
          language: session.user.language,
          preferredInvoiceLanguage: session.user.preferredInvoiceLanguage,
          currency: session.user.currency,
          hasPaymentMethod: session.user.hasPaymentMethod,
          subscriptionStatus: session.user.subscriptionStatus,
          onboardingCompletedAt: session.user.onboardingCompletedAt,
          trialStartedAt: session.user.trialStartedAt,
          trialEndsAt: session.user.trialEndsAt,
          subscriptionGraceEndsAt: session.user.subscriptionGraceEndsAt,
          subscriptionCurrentPeriodEndsAt:
            session.user.subscriptionCurrentPeriodEndsAt,
          subscriptionCancelAt: session.user.subscriptionCancelAt,
          selectedBankAccountId: session.user.selectedBankAccountId
        };
      }

      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub!;
      session.user.language = token.language as string;
      session.user.emailVerifiedAt = token.emailVerifiedAt as string | null;
      session.user.preferredInvoiceLanguage =
        token.preferredInvoiceLanguage as string;
      session.user.currency = token.currency as Currency;
      session.user.hasPaymentMethod = Boolean(token.hasPaymentMethod);
      session.user.isOnboarded = Boolean(token.isOnboarded);
      session.user.subscriptionStatus =
        token.subscriptionStatus as StripeSubscriptionStatus | null;
      session.user.onboardingCompletedAt = token.onboardingCompletedAt as
        | string
        | null;
      session.user.trialStartedAt = token.trialStartedAt as string | null;
      session.user.trialEndsAt = token.trialEndsAt as string | null;
      session.user.subscriptionGraceEndsAt = token.subscriptionGraceEndsAt as
        | string
        | null;
      session.user.subscriptionCurrentPeriodEndsAt =
        token.subscriptionCurrentPeriodEndsAt as string | null;
      session.user.subscriptionCancelAt = token.subscriptionCancelAt as
        | string
        | null;
      session.user.selectedBankAccountId =
        token.selectedBankAccountId as number;

      return session;
    }
  },
  pages: {
    signIn: LOGIN_PAGE,
    error: LOGIN_PAGE
  },
  session: {},
  providers: []
} satisfies NextAuthConfig;
