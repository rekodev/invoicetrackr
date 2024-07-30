import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const publicPaths = ['/login', '/signup', '/forgot-password', '/'];
      const pathIsPublic = publicPaths.includes(nextUrl.pathname);

      if (!pathIsPublic) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      return true;
    },
    session({ session, token }) {
      session.user.id = token.sub!;
      return session;
    },
  },
  session: {},

  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
