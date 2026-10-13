import {
  DEFAULT_CURRENCY,
  type User as InvoiceTrackrUser
} from '@invoicetrackr/types';
import type { NextAuthConfig, User as AuthUser } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { type GoogleProfile } from 'next-auth/providers/google';

import {
  CREATE_INVOICE_PAGE,
  DASHBOARD_PAGE,
  FORGOT_PASSWORD_PAGE,
  HOME_PAGE,
  LOGIN_PAGE,
  ONBOARDING_PAGE,
  PRIVACY_POLICY_PAGE,
  SIGN_UP_PAGE,
  TERMS_OF_SERVICE_PAGE,
  VERIFY_EMAIL_PAGE
} from './lib/constants/pages';

const getServerBaseUrl = () => `http://localhost:${process.env.SERVER_PORT}`;

export const mapUserToSessionUser = (user: InvoiceTrackrUser): AuthUser => {
  if (!user.email) throw new Error('User email is required');
  if (!user.id) throw new Error('User id is required');

  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    image: user.profilePictureUrl || null,
    emailVerifiedAt: user.emailVerifiedAt,
    language: user.language,
    preferredInvoiceLanguage: user.preferredInvoiceLanguage || user.language,
    isVatPayer: user.isVatPayer,
    currency: DEFAULT_CURRENCY,
    selectedBankAccountId: user.selectedBankAccountId || 0,
    isOnboarded: !!user.onboardingCompletedAt,
    analyticsConsentStatus: user.analyticsConsentStatus
  };
};

const setUserTokenFields = (token: JWT, user: AuthUser) => {
  token.sub = String(user.id);
  token.picture = user.image || null;
  token.language = user.language;
  token.emailVerifiedAt = user.emailVerifiedAt;
  token.preferredInvoiceLanguage = user.preferredInvoiceLanguage;
  token.isVatPayer = user.isVatPayer;
  token.currency = DEFAULT_CURRENCY;
  token.isOnboarded = !!user.isOnboarded;
  token.analyticsConsentStatus = user.analyticsConsentStatus;
  token.selectedBankAccountId = user.selectedBankAccountId;
};

const upsertGoogleOAuthUserForSession = async ({
  profile,
  user,
  token
}: {
  profile?: GoogleProfile;
  user?: AuthUser;
  token: JWT;
}) => {
  const email = profile?.email || user?.email || token.email;

  if (!email) {
    throw new Error('Google user is missing an email');
  }

  const response = await fetch(`${getServerBaseUrl()}/api/users/oauth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-Api-Secret': process.env.INTERNAL_API_SECRET ?? ''
    },
    body: JSON.stringify({
      email,
      name: profile?.name || user?.name || undefined,
      image: profile?.picture || user?.image || undefined,
      provider: 'google',
      emailVerified: profile?.email_verified ?? true
    })
  });

  if (!response.ok) {
    throw new Error('Unable to resolve Google user');
  }

  const data = (await response.json()) as { user: InvoiceTrackrUser };

  if (!data.user.id) {
    throw new Error('Google user is missing an InvoiceTrackr id');
  }

  return data.user;
};

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
      const isPublicRecipientDetailsPage = path.startsWith(
        '/invoices/details/'
      );
      const isPublicInvoicePage = path.startsWith('/invoices/public/');
      const isEmailVerificationPage = path.startsWith(VERIFY_EMAIL_PAGE);
      const pathIsPublic =
        publicPaths.includes(path) ||
        path.startsWith('/create-new-password') ||
        isEmailVerificationPage ||
        isPublicInvoiceSigningPage ||
        isPublicRecipientDetailsPage ||
        isPublicInvoicePage;

      const isOnboarded = !!auth?.user?.isOnboarded;
      const isOnboardingPage = path.startsWith(ONBOARDING_PAGE);

      if (!pathIsPublic) {
        if (!isLoggedIn) return Response.redirect(new URL(LOGIN_PAGE, nextUrl));

        // Not onboarded → allow onboarding page, redirect elsewhere
        if (!isOnboarded) {
          return isOnboardingPage
            ? true
            : Response.redirect(new URL(ONBOARDING_PAGE, nextUrl));
        }

        if (isOnboardingPage) {
          return Response.redirect(new URL(DASHBOARD_PAGE, nextUrl));
        }

        return true;
      }

      // Logged in but accessing public path → send to dashboard (except shared paths)
      if (
        isLoggedIn &&
        !sharedPaths.includes(path) &&
        !isEmailVerificationPage &&
        !isPublicInvoiceSigningPage &&
        !isPublicRecipientDetailsPage &&
        !isPublicInvoicePage
      ) {
        return Response.redirect(new URL(DASHBOARD_PAGE, nextUrl));
      }

      return true;
    },
    async jwt({ token, user, account, profile, trigger, session }) {
      if (account?.provider === 'google') {
        const oauthUser = await upsertGoogleOAuthUserForSession({
          profile: profile as GoogleProfile | undefined,
          user,
          token
        });

        setUserTokenFields(token, mapUserToSessionUser(oauthUser));
      } else if (user) {
        setUserTokenFields(token, user);
      }

      if (trigger === 'update') {
        token = {
          ...token,
          sub: session.user.id,
          picture: session.user.image,
          isOnboarded: session.user.isOnboarded,
          emailVerifiedAt: session.user.emailVerifiedAt,
          language: session.user.language,
          preferredInvoiceLanguage: session.user.preferredInvoiceLanguage,
          isVatPayer: session.user.isVatPayer,
          currency: DEFAULT_CURRENCY,
          analyticsConsentStatus: session.user.analyticsConsentStatus,
          selectedBankAccountId: session.user.selectedBankAccountId
        };
      }

      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub!;
      session.user.image = token.picture || null;
      session.user.language = token.language as string;
      session.user.emailVerifiedAt = token.emailVerifiedAt as string | null;
      session.user.preferredInvoiceLanguage =
        token.preferredInvoiceLanguage as string;
      session.user.isVatPayer = Boolean(token.isVatPayer);
      session.user.currency = DEFAULT_CURRENCY;
      session.user.isOnboarded = Boolean(token.isOnboarded);
      session.user.analyticsConsentStatus =
        token.analyticsConsentStatus as AuthUser['analyticsConsentStatus'];
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
