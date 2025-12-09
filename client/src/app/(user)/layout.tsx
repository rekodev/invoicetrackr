import { ReactNode, Suspense } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import Breadcrumbs from '@/components/layout/breadcrumbs';
import { LOGIN_PAGE } from '@/lib/constants/pages';
import { auth } from '@/auth';
import { syncSubscriptionStatus } from '@/lib/utils/sync-subscription';

import '../globals.css';
import Loading from '../loading';

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

  // Sync subscription status from DB on every page load
  await syncSubscriptionStatus(session.user.id);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-grow flex-col px-6">
      <Breadcrumbs />
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </main>
  );
}
