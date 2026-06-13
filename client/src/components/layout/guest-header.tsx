'use client';

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownPopover,
  DropdownTrigger,
  Link,
  Separator,
  buttonVariants
} from '@heroui/react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import {
  CREATE_INVOICE_PAGE,
  HOME_PAGE,
  LOGIN_PAGE,
  SIGN_UP_PAGE
} from '@/lib/constants/pages';

import AppLogo from '../app-logo';
import LanguageSwitcher from './language-switcher';
import ThemeSwitcher from './theme-switcher';

const navbarItems = [
  { name: 'Features', href: '#features' },
  { name: 'Pricing', href: '#pricing' }
];

export default function GuestHeader() {
  const t = useTranslations('header.guest');
  const pathname = usePathname();

  const renderMobileNavbarContent = () => {
    return (
      <Dropdown>
        <DropdownTrigger className="md:hidden">
          <Button isIconOnly variant="secondary">
            <Bars3Icon className="h-5 w-5" />
          </Button>
        </DropdownTrigger>
        <DropdownPopover>
          <DropdownMenu>
            <DropdownItem
              key="create-invoice"
              className="text-secondary"
              href={CREATE_INVOICE_PAGE}
            >
              {t('create_invoice')}
            </DropdownItem>
            <Separator />
            <DropdownItem
              href={LOGIN_PAGE}
              className="text-default-800 flex items-center justify-center"
              key="login"
            >
              {t('login')}
            </DropdownItem>
            <DropdownItem
              key="sign-up"
              href={SIGN_UP_PAGE}
              className="text-default-800"
            >
              {t('sign_up')}
            </DropdownItem>
          </DropdownMenu>
        </DropdownPopover>
      </Dropdown>
    );
  };

  return (
    <header className="border-default-200 bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
        <Link className="flex gap-2" href={HOME_PAGE}>
          <AppLogo />
          <p className="text-default-800 hidden font-bold sm:flex">
            INVOICE
            <span className="text-secondary-400 dark:text-secondary-600">
              TRACKR
            </span>
          </p>
        </Link>

        <div className="hidden gap-4 sm:flex">
          {navbarItems.map((item, index) => {
            const isActive = pathname?.includes(item.href);

            return (
              <div key={index} aria-current={isActive ? 'page' : undefined}>
                <Link
                  href={
                    pathname !== HOME_PAGE ? HOME_PAGE + item.href : item.href
                  }
                  className={buttonVariants({
                    variant: isActive ? 'secondary' : 'primary'
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
          <div className="border-default-300 dark:border-default-100 hidden border-r pr-4 md:flex">
            <Link
              className={buttonVariants({ variant: 'secondary' })}
              href={CREATE_INVOICE_PAGE}
            >
              {t('create_invoice')}
            </Link>
          </div>
          <div className="hidden md:flex">
            <Link className="text-secondary" href={LOGIN_PAGE}>
              {t('login')}
            </Link>
          </div>
          <div className="hidden md:flex">
            <Link
              href={SIGN_UP_PAGE}
              className={buttonVariants({ variant: 'tertiary' })}
            >
              {t('sign_up')}
            </Link>
          </div>
          <div className="border-default-100 border-l-1 h-10" />
          <LanguageSwitcher />
          <div className="-ml-2">
            <ThemeSwitcher />
          </div>
        </div>
      </nav>
    </header>
  );
}
