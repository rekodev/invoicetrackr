'use client';

import {
  Cog6ToothIcon,
  CreditCardIcon,
  LockClosedIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  Avatar,
  Card,
  CardBody,
  CardHeader,
  Listbox,
  ListboxItem,
} from '@nextui-org/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  ACCOUNT_SETTINGS_PAGE,
  BANKING_INFORMATION_PAGE,
  CHANGE_PASSWORD_PAGE,
  PERSONAL_INFORMATION_PAGE,
} from '@/constants/pages';
import { UserModel } from '@/types/models/user';

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
      <CardBody className='flex justify-center'>
        <Listbox aria-label='Actions'>
          <ListboxItem
            startContent={<UserIcon className='w-4 h-4' />}
            key='personal-information'
            as={Link}
            href={PERSONAL_INFORMATION_PAGE}
            className={`${
              currentPath === UserNavKeys.PersonalInformation && 'bg-purple-500'
            }`}
          >
            Personal Information
          </ListboxItem>
          <ListboxItem
            startContent={<CreditCardIcon className='w-4 h-4' />}
            key='banking-information'
            as={Link}
            href={BANKING_INFORMATION_PAGE}
            className={`${
              currentPath === UserNavKeys.BankingInformation && 'bg-purple-500'
            }`}
          >
            Banking Information
          </ListboxItem>
          <ListboxItem
            startContent={<LockClosedIcon className='w-4 h-4' />}
            key='change-password'
            as={Link}
            href={CHANGE_PASSWORD_PAGE}
            className={`${
              currentPath === UserNavKeys.ChangePassword && 'bg-purple-500'
            }`}
          >
            Change Password
          </ListboxItem>
          <ListboxItem
            as={Link}
            href={ACCOUNT_SETTINGS_PAGE}
            startContent={<Cog6ToothIcon className='w-4 h-4' />}
            key='account-settings'
            className={`${
              currentPath === UserNavKeys.AccountSettings && 'bg-purple-500'
            }`}
          >
            Account Settings
          </ListboxItem>
        </Listbox>
      </CardBody>
    </Card>
  );
};

export default UserCard;
