import { ReactNode } from 'react';

import { getUser } from '@/api';
import UserNavCard from '@/components/user/UserNavCard';

export async function ProfilePageLayout({ children }: { children: ReactNode }) {
  const user = await getUser(1);

  return (
    <section className='flex flex-col sm:flex-row gap-6'>
      <UserNavCard user={user.data} />
      {children}
    </section>
  );
}

export default ProfilePageLayout;
