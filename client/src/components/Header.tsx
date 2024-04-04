'use client';

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
  useUser,
} from '@nextui-org/react';
import { usePathname, useRouter } from 'next/navigation.js';

import {
  CLIENTS_PAGE,
  CONTRACTS_PAGE,
  INVOICES_PAGE,
  PROFILE_PAGE,
} from '@/constants/pages';
import useGetUser from '@/hooks/useGetUser';

import AcmeLogo from './icons/AcmeLogo.jsx';

const navbarItems = [
  { name: 'Invoices', href: INVOICES_PAGE },
  { name: 'Contracts', href: CONTRACTS_PAGE },
  { name: 'Clients', href: CLIENTS_PAGE },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useGetUser();

  const navigateToProfilePage = () => {
    router.push(PROFILE_PAGE);
  };

  return (
    <Navbar isBordered>
      <NavbarBrand>
        <AcmeLogo />
        <p className='font-bold text-inherit'>ACME</p>
      </NavbarBrand>

      <NavbarContent className='hidden sm:flex gap-4' justify='center'>
        {navbarItems.map((item, index) => {
          const isActive = pathname.includes(item.href);

          return (
            <NavbarItem key={index} isActive={isActive}>
              <Link
                href={item.href}
                aria-current='page'
                color={isActive ? 'secondary' : 'foreground'}
              >
                {item.name}
              </Link>
            </NavbarItem>
          );
        })}
      </NavbarContent>

      <NavbarContent as='div' justify='end'>
        <Dropdown placement='bottom-end'>
          <DropdownTrigger>
            <Avatar
              isBordered
              as='button'
              className='transition-transform'
              color='secondary'
              name={user?.name}
              size='sm'
              src='https://i.pravatar.cc/150?u=a042581f4e29026704d'
            />
          </DropdownTrigger>
          <DropdownMenu aria-label='Profile Actions' variant='flat'>
            <DropdownItem key='profile' className='h-14 gap-2'>
              <p className='font-semibold'>Signed in as</p>
              <p className='font-semibold'>{user?.email}</p>
            </DropdownItem>
            <DropdownItem key='profile' onClick={navigateToProfilePage}>
              My Profile
            </DropdownItem>
            <DropdownItem key='logout' color='danger'>
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  );
}
