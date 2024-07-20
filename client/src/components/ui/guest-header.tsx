'use client';

import {
  Button,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from '@nextui-org/react';
import { usePathname } from 'next/navigation';

import {
  DASHBOARD_PAGE,
  LOGIN_PAGE,
  SIGN_UP_PAGE,
} from '@/lib/constants/pages';

import AcmeLogo from '../icons/AcmeLogo.jsx';

const navbarItems = [
  { name: 'Features', href: '#' },
  { name: 'Customers', href: '#' },
  { name: 'Pricing', href: '#' },
  { name: 'Company', href: '#' },
];

export default function UserHeader() {
  const pathname = usePathname();

  return (
    <Navbar isBordered>
      <NavbarBrand className='text-white' as={Link} href={DASHBOARD_PAGE}>
        <AcmeLogo />
        <p className='font-bold text-inherit'>ACME</p>
      </NavbarBrand>

      <NavbarContent className='hidden sm:flex gap-4' justify='center'>
        {navbarItems.map((item, index) => {
          const isActive = pathname?.includes(item.href);

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
        <NavbarItem className='hidden lg:flex'>
          <Link color='secondary' href={LOGIN_PAGE}>
            Login
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Button
            as={Link}
            color='secondary'
            href={SIGN_UP_PAGE}
            variant='flat'
          >
            Sign Up
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
