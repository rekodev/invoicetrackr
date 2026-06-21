'use client';

import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownPopover,
  DropdownTrigger,
  Link,
  Separator,
  buttonVariants,
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

import AppBrand from '../app-brand';

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
      <DropdownTrigger
        aria-label="Open menu"
        className={buttonVariants({
          variant: 'secondary',
          isIconOnly: true,
          className: 'flex items-center justify-center md:hidden'
        })}
      >
        <Bars3Icon className="h-5 w-5" />
      </DropdownTrigger>
      <DropdownPopover>
        <DropdownMenu>
          {navbarItems.map((item, index) => {
            const isActive = pathname?.includes(item.href);

            return (
              <DropdownItem
                key={`mobile-${index}`}
                href={item.href}
                className={cn('text-muted w-full', {
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
          <AppBrand wordmarkClassName="hidden sm:flex" />
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
          <Separator orientation="vertical" className="md:hidden" />
          <Dropdown>
            <DropdownTrigger>
              <Avatar
                className={cn(
                  'cursor-pointer transition-transform',
                  pathname?.includes('profile') &&
                    'ring-accent ring-2 ring-offset-2'
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
                    onPress={logOutAction}
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
          <Separator orientation="vertical" />
          <LanguageSwitcher user={user} />
          <div className="-ml-2">
            <ThemeSwitcher />
          </div>
        </div>
      </nav>
    </header>
  );
}
