import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const publicPaths = ['/login', '/sign-up', '/forgot-password', '/'];
      const pathIsPublic = publicPaths.includes(nextUrl.pathname);

      if (!pathIsPublic) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      return true;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.language = user.language;
        token.currency = user.currency;
      }

      if (trigger === 'update') {
        token = {
          ...token,
          language: session.user.language,
          currency: session.user.currency,
        };
      }

      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub!;
      session.user.language = token.language as string;
      session.user.currency = token.currency as string;
      return session;
    },
  },
  session: {},
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
