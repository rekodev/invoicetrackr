'use client';

import { Spinner } from '@nextui-org/react';
import { ComponentType, ReactNode } from 'react';

import useGetUser from '@/hooks/user/useGetUser';
import { UserModel } from '@/types/models/user';

import ErrorAlert from '../ui/ErrorAlert';
import UserNavCard from '../user/UserNavCard';

type Props = {
  ProfileComponent: ComponentType<{ user: UserModel | undefined }>;
  children?: ReactNode;
};

const ProfilePageLayout = ({ ProfileComponent, children }: Props) => {
  const { user, isUserLoading, userError } = useGetUser();

  if (isUserLoading) return <Spinner color='secondary' />;

  if (userError) return <ErrorAlert />;

  return (
    <section className='flex flex-col sm:flex-row gap-6'>
      <UserNavCard user={user} />
      <ProfileComponent user={user} />
      {children}
    </section>
  );
};

export default ProfilePageLayout;
