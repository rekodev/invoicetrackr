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
} from '@nextui-org/react';
import { usePathname } from 'next/navigation.js';

import { CLIENTS_PAGE, CONTRACTS_PAGE, INVOICES_PAGE } from '@/constants/pages';

import AcmeLogo from './icons/AcmeLogo.jsx';

const navbarItems = [
  { name: 'Invoices', href: INVOICES_PAGE },
  { name: 'Contracts', href: CONTRACTS_PAGE },
  { name: 'Clients', href: CLIENTS_PAGE },
];

export default function Header() {
  const pathname = usePathname();

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
              name='Jason Hughes'
              size='sm'
              src='https://i.pravatar.cc/150?u=a042581f4e29026704d'
            />
          </DropdownTrigger>
          <DropdownMenu aria-label='Profile Actions' variant='flat'>
            <DropdownItem key='profile' className='h-14 gap-2'>
              <p className='font-semibold'>Signed in as</p>
              <p className='font-semibold'>zoey@example.com</p>
            </DropdownItem>
            <DropdownItem key='settings'>My Settings</DropdownItem>
            <DropdownItem key='team_settings'>Team Settings</DropdownItem>
            <DropdownItem key='analytics'>Analytics</DropdownItem>
            <DropdownItem key='system'>System</DropdownItem>
            <DropdownItem key='configurations'>Configurations</DropdownItem>
            <DropdownItem key='help_and_feedback'>Help & Feedback</DropdownItem>
            <DropdownItem key='logout' color='danger'>
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  );
}
