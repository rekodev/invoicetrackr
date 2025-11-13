import { ReactNode } from 'react';
import { unauthorized } from 'next/navigation';

import UserNavCard from '@/components/profile/user-nav-card';
import { auth } from '@/auth';
import { getUser } from '@/api/user';
import { isResponseError } from '@/lib/utils/error';

export default async function ProfilePageLayout({
  children
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) return null;

  const response = await getUser(Number(session.user.id));

  if (isResponseError(response)) unauthorized();

  return (
    <section className="flex flex-col gap-6 sm:flex-row">
      <UserNavCard user={response.data.user} />
      {children}
    </section>
  );
}
