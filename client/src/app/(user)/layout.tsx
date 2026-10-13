import '../globals.css';

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ReactNode, Suspense } from 'react';

import { getUser } from '@/api/user';
import { auth } from '@/auth';
import AuthenticatedShell, {
  type ShellUser
} from '@/components/layout/authenticated-shell';
import RateLimitNotice from '@/components/ui/rate-limit-notice';
import { LOGIN_PAGE } from '@/lib/constants/pages';
import { isRateLimitError, isResponseError } from '@/lib/utils/error';
import { getShellUserFromSession } from '@/lib/utils/user';

import Loading from '../loading';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false }
  },
  referrer: 'no-referrer'
};

const renderShell = (user: ShellUser, content: ReactNode) => (
  <AuthenticatedShell user={user}>
    <main className="p-page mx-auto flex w-full max-w-7xl flex-grow flex-col pb-12">
      {content}
    </main>
  </AuthenticatedShell>
);

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

  if (isRateLimitError(response)) {
    return renderShell(
      getShellUserFromSession(session.user),
      <RateLimitNotice />
    );
  }

  if (isResponseError(response)) throw new Error('Failed to load account');

  return renderShell(
    response.data.user,
    <Suspense fallback={<Loading />}>{children}</Suspense>
  );
}
