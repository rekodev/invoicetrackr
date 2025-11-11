import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import Breadcrumbs from '@/components/breadcrumbs';
import LanguageSync from '@/components/language-sync';
import { LOGIN_PAGE } from '@/lib/constants/pages';
import { auth } from '@/auth';

import '../globals.css';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false }
  },
  referrer: 'no-referrer'
};

export default async function UserLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    redirect(LOGIN_PAGE);
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-grow flex-col px-6">
      <LanguageSync userLanguage={session?.user?.language} />
      <Breadcrumbs />
      {children}
    </main>
  );
}
