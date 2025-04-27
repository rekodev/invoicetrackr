import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface User {
    id: string;
    name: string;
    email: string;
    language: string;
    currency: string;
    type: string;
    businessType: string;
    businessNumber: string;
    selectedBankAccountId: string;
    address: string;
    email: string;
    isOnboarded: boolean;
  }

  interface Session {
    user: User & DefaultSession['user'];
    accessToken: string;
  }
}
