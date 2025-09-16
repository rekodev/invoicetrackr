import { ReactNode } from 'react';

import { getUser } from '@/api';
import { auth } from '@/auth';
import UserNavCard from '@/components/profile/user-nav-card';

export default async function ProfilePageLayout({
  children
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) return null;

  const response = await getUser(Number(session.user.id));

  return (
    <section className="flex flex-col gap-6 sm:flex-row">
      <UserNavCard user={response.data} />
      {children}
    </section>
  );
}
