'use client';

import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  cn
} from '@heroui/react';
import { usePathname, useRouter } from 'next/navigation';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';

import {
  CLIENTS_PAGE,
  CONTRACTS_PAGE,
  DASHBOARD_PAGE,
  HOME_PAGE,
  INVOICES_PAGE,
  PERSONAL_INFORMATION_PAGE
} from '@/lib/constants/pages';
import { UserModel } from '@/lib/types/models/user';
import { logOutAction } from '@/lib/actions';

import LanguageSwitcher from './language-switcher';
import ThemeSwitcher from './theme-switcher';

import AppLogo from '../icons/AppLogo';

const navbarItems = [
  { name: 'Dashboard', href: DASHBOARD_PAGE },
  { name: 'Invoices', href: INVOICES_PAGE },
  { name: 'Contracts', href: CONTRACTS_PAGE },
  { name: 'Clients', href: CLIENTS_PAGE }
];

type Props = {
  user: UserModel;
};

export default function UserHeader({ user }: Props) {
  const t = useTranslations('header.user');
  const pathname = usePathname();
  const router = useRouter();

  const navigateToProfilePage = () => {
    router.push(PERSONAL_INFORMATION_PAGE);
  };

  const renderMobileNavbarContent = () => (
    <Dropdown>
      <DropdownTrigger className="md:hidden">
        <Button isIconOnly variant="faded" color="secondary">
          <Bars3Icon className="h-5 w-5" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu>
        {navbarItems.map((item, index) => {
          const isActive = pathname?.includes(item.href);

          return (
            <DropdownItem
              as={Link}
              key={`mobile-${index}`}
              href={item.href}
              className={cn('text-default-800 w-full', {
                'text-secondary': isActive
              })}
            >
              {item.name}
            </DropdownItem>
          );
        })}
      </DropdownMenu>
    </Dropdown>
  );

  return (
    <Navbar isBordered maxWidth="xl">
      <NavbarBrand className="flex gap-2 text-white" as={Link} href={HOME_PAGE}>
        <AppLogo />
        <p className="text-default-800 hidden font-bold sm:flex">
          INVOICE
          <span className="text-secondary-400 dark:text-secondary-600">
            TRACKR
          </span>
        </p>
      </NavbarBrand>

      <NavbarContent className="hidden gap-4 md:flex" justify="center">
        {navbarItems.map((item, index) => {
          const isActive = pathname?.includes(item.href);

          return (
            <NavbarItem key={index} isActive={isActive}>
              <Link
                href={item.href}
                aria-current="page"
                className={cn('text-foreground', {
                  'text-secondary': isActive
                })}
              >
                {t(item.name.toLowerCase())}
              </Link>
            </NavbarItem>
          );
        })}
      </NavbarContent>

      <NavbarContent as="div" justify="end">
        {renderMobileNavbarContent()}
        <div className="h-full py-3 md:hidden">
          <div className="border-default-300 dark:border-default-100 h-full border-r" />
        </div>
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              isBordered={pathname?.includes('profile')}
              as="button"
              className="transition-transform"
              color="secondary"
              name={user.name}
              size="sm"
              src={user.profilePictureUrl}
            />
          </DropdownTrigger>
          <form action={logOutAction}>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="signed-in-as" className="h-14 gap-2">
                <p className="font-semibold">{t('signed_in_as')}</p>
                <p className="font-semibold">{user.email}</p>
              </DropdownItem>
              <DropdownItem key="profile" onPress={navigateToProfilePage}>
                {t('my_profile')}
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                as="button"
                itemType="submit"
                className="text-left"
              >
                {t('log_out')}
              </DropdownItem>
            </DropdownMenu>
          </form>
        </Dropdown>
        <div className="border-default-100 border-l-1 h-10" />
        <LanguageSwitcher user={user} />
        <NavbarItem className="-ml-2">
          <ThemeSwitcher />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
