import type { User } from 'next-auth';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google, { type GoogleProfile } from 'next-auth/providers/google';
import { z } from 'zod';

import { loginUser } from './api/user';
import { authConfig, mapUserToSessionUser } from './auth.config';
import { isResponseError } from './lib/utils/error';

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
