'use client';

import { Bars3Icon } from '@heroicons/react/24/outline';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Navbar,
  NavbarBrand,
  NavbarContent,
  Link,
  NavbarItem
} from '@heroui/react';
import { usePathname } from 'next/navigation';

import {
  CREATE_INVOICE_PAGE,
  HOME_PAGE,
  LOGIN_PAGE,
  SIGN_UP_PAGE
} from '@/lib/constants/pages';

import ThemeSwitcher from './theme-switcher';
import AppLogo from '../icons/AppLogo';

const navbarItems = [
  { name: 'Features', href: '#features' },
  { name: 'Pricing', href: '#pricing' }
];

export default function GuestHeader() {
  const pathname = usePathname();

  const renderMobileNavbarContent = () => {
    return (
      <Dropdown>
        <DropdownTrigger className="md:hidden">
          <Button isIconOnly color="secondary" variant="faded">
            <Bars3Icon className="h-5 w-5" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu>
          <DropdownItem
            key="create-invoice"
            className="text-secondary"
            color="secondary"
            as={Link}
            href={CREATE_INVOICE_PAGE}
            showDivider
          >
            Create Invoice
          </DropdownItem>
          <DropdownItem
            as={Link}
            href={LOGIN_PAGE}
            className="text-default-800 flex items-center justify-center"
            key="login"
          >
            Login
          </DropdownItem>
          <DropdownItem
            key="sign-up"
            as={Link}
            href={SIGN_UP_PAGE}
            className="text-default-800"
          >
            Sign Up
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
  };

  return (
    <Navbar isBordered maxWidth="xl">
      <NavbarBrand className="flex gap-2" as={Link} href={HOME_PAGE}>
        <AppLogo />
        <p className="text-default-800 hidden font-bold sm:flex">
          INVOICE
          <span className="text-secondary-400 dark:text-secondary-600">
            TRACKR
          </span>
        </p>
      </NavbarBrand>

      <NavbarContent justify="start" className="hidden gap-4 sm:flex">
        {navbarItems.map((item, index) => {
          const isActive = pathname?.includes(item.href);

          return (
            <NavbarItem key={index} isActive={isActive}>
              <Link
                href={
                  pathname !== HOME_PAGE ? HOME_PAGE + item.href : item.href
                }
                aria-current="page"
                color={isActive ? 'secondary' : 'foreground'}
              >
                {item.name}
              </Link>
            </NavbarItem>
          );
        })}
      </NavbarContent>

      <NavbarContent as="div" justify="end">
        {renderMobileNavbarContent()}
        <NavbarItem className="border-default-300 dark:border-default-100 hidden border-r pr-4 md:flex">
          <Button
            as={Link}
            color="secondary"
            variant="faded"
            href={CREATE_INVOICE_PAGE}
          >
            Create Invoice
          </Button>
        </NavbarItem>
        <NavbarItem className="hidden md:flex">
          <Link className="text-secondary" href={LOGIN_PAGE}>
            Login
          </Link>
        </NavbarItem>
        <NavbarItem className="hidden md:flex">
          <Button
            as={Link}
            href={SIGN_UP_PAGE}
            color="secondary"
            variant="flat"
          >
            Sign Up
          </Button>
        </NavbarItem>
        <NavbarItem className="border-default-300 dark:border-default-100 border-l pl-4">
          <ThemeSwitcher />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
