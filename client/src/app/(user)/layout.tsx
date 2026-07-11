import '../globals.css';

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ReactNode, Suspense } from 'react';

import { getUser } from '@/api/user';
import { auth } from '@/auth';
import AuthenticatedShell from '@/components/layout/authenticated-shell';
import Breadcrumbs from '@/components/layout/breadcrumbs';
import { LOGIN_PAGE } from '@/lib/constants/pages';
import { isResponseError } from '@/lib/utils/error';

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

  const response = await getUser(Number(session.user.id));
  if (isResponseError(response)) redirect(LOGIN_PAGE);

  return (
    <AuthenticatedShell user={response.data.user}>
      <main className="mx-auto flex w-full max-w-7xl flex-grow flex-col p-6 pb-12">
        <Breadcrumbs />
        <Suspense fallback={<Loading />}>{children}</Suspense>
      </main>
    </AuthenticatedShell>
  );
}
