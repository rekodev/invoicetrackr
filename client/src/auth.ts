import Credentials from 'next-auth/providers/credentials';
import NextAuth from 'next-auth';
import { z } from 'zod';

import { authConfig } from './auth.config';
import { loginUser } from './api';

export const { auth, signIn, signOut, unstable_update, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const response = (await loginUser(email, password)).data;

          const { user } = response;

          if (!user) return null;

          return { ...user, id: String(user.id) };
        }

        return null;
      }
    })
  ]
});
