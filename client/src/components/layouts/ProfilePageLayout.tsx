import { ReactNode } from 'react';

import UserNavCard from '../user/UserNavCard';

type Props = {
  children: ReactNode;
};

const ProfilePageLayout = ({ children }: Props) => {
  return (
    <section className='flex flex-col sm:flex-row gap-6'>
      <UserNavCard />
      {children}
    </section>
  );
};

export default ProfilePageLayout;
