import Credentials from 'next-auth/providers/credentials';
import NextAuth from 'next-auth';
import { z } from 'zod';

import { Currency } from './lib/types/currency';
import { authConfig } from './auth.config';
import { isResponseError } from './lib/utils/error';
import { loginUser } from './api/user';

export const { auth, signIn, signOut, unstable_update, handlers } = NextAuth({
  ...authConfig,
  providers: [
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

          return {
            id: String(user.id),
            name: user.name,
            email: user.email,
            language: user.language,
            preferredInvoiceLanguage:
              user.preferredInvoiceLanguage || user.language,
            currency: user.currency as Currency,
            type: user.type,
            businessType: user.businessType,
            businessNumber: user.businessNumber,
            vatNumber: user.vatNumber,
            selectedBankAccountId: user.selectedBankAccountId || 0,
            address: user.address,
            stripeCustomerId: user.stripeCustomerId,
            stripeSubscriptionId: user.stripeSubscriptionId,
            isSubscriptionActive: user.isSubscriptionActive
          };
        }

        return null;
      }
    })
  ]
});
