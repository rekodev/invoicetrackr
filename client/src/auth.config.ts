import type { NextAuthConfig } from 'next-auth';

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
      // TODO: Implement actual isOnboarded logic
      const isOnboarded = nextUrl.pathname.startsWith('/onboarding');

      if (!pathIsPublic) {
        if (isLoggedIn)
          return isOnboarded
            ? true
            : Response.redirect(new URL('/onboarding', nextUrl));
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
          currency: session.user.currency
        };
      }

      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub!;
      session.user.language = token.language as string;
      session.user.currency = token.currency as string;

      return session;
    }
  },
  session: {},
  providers: [] // Add providers with an empty array for now
} satisfies NextAuthConfig;
