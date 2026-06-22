import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { type GoogleProfile } from 'next-auth/providers/google';
import type { User as InvoiceTrackrUser } from '@invoicetrackr/types';
import NextAuth from 'next-auth';
import type { User } from 'next-auth';
import { z } from 'zod';

import { loginUser, upsertGoogleOAuthUser } from './api/user';
import { Currency } from './lib/types/currency';
import { authConfig } from './auth.config';
import { isResponseError } from './lib/utils/error';

const mapUserToSessionUser = (user: InvoiceTrackrUser): User => {
  if (!user.email) throw new Error('User email is required');

  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    emailVerifiedAt: user.emailVerifiedAt,
    language: user.language,
    preferredInvoiceLanguage: user.preferredInvoiceLanguage || user.language,
    currency: user.currency as Currency,
    type: user.type,
    businessType: user.businessType,
    businessNumber: user.businessNumber,
    vatNumber: user.vatNumber,
    selectedBankAccountId: user.selectedBankAccountId || 0,
    address: user.address,
    stripeCustomerId: user.stripeCustomerId,
    stripeSubscriptionId: user.stripeSubscriptionId,
    subscriptionStatus: user.subscriptionStatus,
    onboardingCompletedAt: user.onboardingCompletedAt,
    trialStartedAt: user.trialStartedAt,
    trialEndsAt: user.trialEndsAt,
    subscriptionGraceEndsAt: user.subscriptionGraceEndsAt,
    subscriptionCurrentPeriodEndsAt: user.subscriptionCurrentPeriodEndsAt,
    subscriptionCancelAt: user.subscriptionCancelAt
  };
};

export const { auth, signIn, signOut, unstable_update, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      async profile(profile: GoogleProfile) {
        const response = await upsertGoogleOAuthUser({
          email: profile.email,
          name: profile.name,
          image: profile.picture,
          emailVerified: profile.email_verified
        });

        if (isResponseError(response)) {
          throw new Error(response.data.message);
        }

        return mapUserToSessionUser(response.data.user);
      }
    }),
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const response = await loginUser(email, password);

          if (isResponseError(response)) return null;

          const user = response.data.user;

          if (!user || !user.email) return null;

          return mapUserToSessionUser(user);
        }

        return null;
      }
    })
  ]
});
