'use client';

import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownPopover,
  DropdownTrigger,
  Link,
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
import { User } from '@invoicetrackr/types';
import { logOutAction } from '@/lib/actions';

import LanguageSwitcher from './language-switcher';
import ThemeSwitcher from './theme-switcher';

import AppLogo from '../app-logo';

const navbarItems = [
  { name: 'Dashboard', href: DASHBOARD_PAGE },
  { name: 'Invoices', href: INVOICES_PAGE },
  { name: 'Contracts', href: CONTRACTS_PAGE },
  { name: 'Clients', href: CLIENTS_PAGE }
];

type Props = {
  user: User;
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
        <Button isIconOnly variant="secondary">
          <Bars3Icon className="h-5 w-5" />
        </Button>
      </DropdownTrigger>
      <DropdownPopover>
        <DropdownMenu>
          {navbarItems.map((item, index) => {
            const isActive = pathname?.includes(item.href);

            return (
              <DropdownItem
                key={`mobile-${index}`}
                href={item.href}
                className={cn('text-default-800 w-full', {
                  'text-primary': isActive
                })}
              >
                {item.name}
              </DropdownItem>
            );
          })}
        </DropdownMenu>
      </DropdownPopover>
    </Dropdown>
  );

  return (
    <header className="border-default-200 bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
        <Link className="flex gap-2 text-white" href={HOME_PAGE}>
          <AppLogo />
          <p className="text-default-800 hidden font-bold sm:flex">
            INVOICE
            <span className="text-secondary-400 dark:text-secondary-600">
              TRACKR
            </span>
          </p>
        </Link>

        <div className="hidden gap-4 md:flex">
          {navbarItems.map((item, index) => {
            const isActive = pathname?.includes(item.href);

            return (
              <div key={index} aria-current={isActive ? 'page' : undefined}>
                <Link
                  href={item.href}
                  className={cn('text-foreground', {
                    'text-primary': isActive
                  })}
                >
                  {t(item.name.toLowerCase())}
                </Link>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-3">
          {renderMobileNavbarContent()}
          <div className="h-full py-3 md:hidden">
            <div className="border-default-300 dark:border-default-100 h-full border-r" />
          </div>
          <Dropdown>
            <DropdownTrigger>
              <Avatar
                className={cn(
                  'cursor-pointer transition-transform',
                  pathname?.includes('profile') &&
                    'ring-primary ring-2 ring-offset-2'
                )}
              >
                <Avatar.Image
                  alt={user.name ?? 'User avatar'}
                  src={user.profilePictureUrl}
                />

                <Avatar.Fallback>
                  {user.name
                    ?.split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() ?? 'U'}
                </Avatar.Fallback>
              </Avatar>
            </DropdownTrigger>
            <DropdownPopover>
              <form action={logOutAction}>
                <DropdownMenu aria-label={t('a11y.profile_actions_label')}>
                  <DropdownItem key="signed-in-as" className="h-14 gap-2">
                    <p className="font-semibold">{t('signed_in_as')}</p>
                    <p className="font-semibold">{user.email}</p>
                  </DropdownItem>
                  <DropdownItem key="profile" onPress={navigateToProfilePage}>
                    {t('my_profile')}
                  </DropdownItem>
                  <DropdownItem
                    key="logout"
                    variant="danger"
                    className="text-left"
                  >
                    {t('log_out')}
                  </DropdownItem>
                </DropdownMenu>
              </form>
            </DropdownPopover>
          </Dropdown>
          <div className="border-default-100 border-l-1 h-10" />
          <LanguageSwitcher user={user} />
          <div className="-ml-2">
            <ThemeSwitcher />
          </div>
        </div>
      </nav>
    </header>
  );
}
