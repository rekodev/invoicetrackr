import { ReactNode } from 'react';

import { auth } from '@/auth';
import UserNavCard from '@/components/profile/UserNavCard';

export async function ProfilePageLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) return null;

  return (
    <section className='flex flex-col sm:flex-row gap-6'>
      <UserNavCard userId={Number(session.user.id)} />
      {children}
    </section>
  );
}

export default ProfilePageLayout;
