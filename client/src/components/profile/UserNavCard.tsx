'use client';

import {
  Avatar,
  Card,
  CardBody,
  CardHeader,
  Tab,
  Tabs,
} from '@nextui-org/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { profileMenuTabs } from '@/lib/constants/profile';
import { UserModel } from '@/lib/types/models/user';

enum UserNavKeys {
  PersonalInformation = 'personal-information',
  BankingInformation = 'banking-information',
  ChangePassword = 'change-password',
  AccountSettings = 'account-settings',
}

type Props = {
  user: UserModel | undefined;
};

const UserCard = ({ user }: Props) => {
  const pathname = usePathname();

  const currentPath = pathname?.split('/')[2];

  return (
    <Card
      as='aside'
      className='flex flex-col justify-between min-w-56 min-h-80 max-h-80 sm:max-w-56 pt-3 border border-neutral-800 bg-transparent'
    >
      <CardHeader className='flex-col'>
        <Avatar size='lg' className='mb-2' />
        <p className='text-md'>{user?.name}</p>
        <p className='text-small text-default-500'>{user?.email}</p>
      </CardHeader>
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
