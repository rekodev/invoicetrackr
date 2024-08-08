'use client';

import {
  Avatar,
  Card,
  CardBody,
  CardHeader,
  Skeleton,
  Tab,
  Tabs,
} from '@nextui-org/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { profileMenuTabs } from '@/lib/constants/profile';
import useGetUser from '@/lib/hooks/user/useGetUser';

type Props = {
  userId: number;
};

const UserCard = ({ userId }: Props) => {
  const pathname = usePathname();
  const { user, isUserLoading } = useGetUser({ userId });

  const currentPath = pathname?.split('/')[2];

  const renderUserDetails = () => {
    if (isUserLoading)
      return (
        <>
          <Skeleton className='h-14 rounded-full w-14 mb-2' />
          <Skeleton className='h-3 w-2/5 rounded-lg mt-2' />
          <Skeleton className='h-3 w-3/5 rounded-lg mt-2 mb-1' />
        </>
      );

    return (
      <>
        <Avatar size='lg' className='mb-2' />
        <p className='text-md'>{user?.name || 'User'}</p>
        <p className='text-small text-default-500'>{user?.email}</p>
      </>
    );
  };

  return (
    <Card
      as='aside'
      className='flex flex-col justify-between min-w-56 min-h-80 max-h-80 sm:max-w-56 pt-3 border border-neutral-800 bg-transparent'
    >
      <CardHeader className='flex-col'>{renderUserDetails()}</CardHeader>
      <CardBody className='flex justify-center p-0 px-2'>
        <Tabs
          aria-label='Actions'
          isVertical
          disableAnimation
          selectedKey={currentPath}
          fullWidth
          variant='light'
          color='secondary'
        >
          {profileMenuTabs.map((tab) => (
            <Tab
              key={tab.key}
              className='justify-start'
              title={
                <div className='flex items-center space-x-2'>
                  {tab.icon}
                  <span>{tab.name}</span>
                </div>
              }
              as={Link}
              href={tab.href}
            />
          ))}
        </Tabs>
      </CardBody>
    </Card>
  );
};

export default UserCard;
