import Google, { type GoogleProfile } from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import type { User as InvoiceTrackrUser } from '@invoicetrackr/types';
import NextAuth from 'next-auth';
import type { User } from 'next-auth';
import { z } from 'zod';

import { Currency } from './lib/types/currency';
import { authConfig } from './auth.config';
import { isResponseError } from './lib/utils/error';
import { loginUser } from './api/user';

const mapUserToSessionUser = (user: InvoiceTrackrUser): User => {
  if (!user.email) throw new Error('User email is required');
  if (!user.id) throw new Error('User id is required');

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
      profile(profile: GoogleProfile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture
        } as User;
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
