import { ReactNode } from 'react';

import { auth } from '@/auth';
import UserNavCard from '@/components/profile/user-nav-card';

export default async function ProfilePageLayout({
  children
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) return null;

  return (
    <section className="flex flex-col gap-6 sm:flex-row">
      <UserNavCard userId={Number(session.user.id)} />
      {children}
    </section>
  );
}
