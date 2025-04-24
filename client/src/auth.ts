import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

import { loginUser } from './api';
import { authConfig } from './auth.config';

export const { auth, signIn, signOut, unstable_update } = NextAuth({
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
