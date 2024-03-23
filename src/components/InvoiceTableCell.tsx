import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  User,
} from '@nextui-org/react';
import { Key } from 'react';

import { UserModel, UserStatus } from '@/types/models/user';

import { VerticalDotsIcon } from './icons/VerticalDotsIcon';

const statusColorMap: Record<UserStatus, 'success' | 'danger' | 'warning'> = {
  active: 'success',
  paused: 'danger',
  vacation: 'warning',
};

type Props = {
  user: UserModel;
  columnKey: Key;
};

const InvoiceTableCell = ({ user, columnKey }: Props) => {
  const cellValue =
    columnKey !== 'actions' && user[columnKey as keyof UserModel];

  switch (columnKey) {
    case 'name':
      return (
        <User
          avatarProps={{ radius: 'lg', src: user.avatar }}
          description={user.email}
          name={cellValue}
        >
          {user.email}
        </User>
      );
    case 'role':
      return (
        <div className='flex flex-col'>
          <p className='text-bold text-small capitalize'>{cellValue}</p>
          <p className='text-bold text-tiny capitalize text-default-400'>
            {user.team}
          </p>
        </div>
      );
    case 'status':
      return (
        <Chip
          className='capitalize'
          color={statusColorMap[user.status]}
          size='sm'
          variant='flat'
        >
          {cellValue}
        </Chip>
      );
    case 'actions':
      return (
        <div className='relative flex justify-end items-center gap-2'>
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size='sm' variant='light'>
                <VerticalDotsIcon
                  className='text-default-300'
                  width={16}
                  height={16}
                />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem>View</DropdownItem>
              <DropdownItem>Edit</DropdownItem>
              <DropdownItem>Delete</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      );
    default:
      return cellValue;
  }
};

export default InvoiceTableCell;
