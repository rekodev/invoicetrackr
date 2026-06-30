'use client';

import {
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
import { Bars3Icon } from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import {
  CREATE_INVOICE_PAGE,
  HOME_PAGE,
  LOGIN_PAGE,
  SIGN_UP_PAGE
} from '@/lib/constants/pages';

import AppBrand from '../app-brand';
import LanguageSwitcher from './language-switcher';
import ThemeSwitcher from './theme-switcher';

const navbarItems = [
  { key: 'features', href: '#features' },
  { key: 'pricing', href: '#pricing' },
  { key: 'faq', href: '#faq' }
];

export default function GuestHeader() {
  const t = useTranslations('header.guest');
  const pathname = usePathname();
  const getNavbarHref = (href: string) =>
    pathname !== HOME_PAGE ? HOME_PAGE + href : href;

  const renderMobileNavbarContent = () => {
    return (
      <Dropdown>
        <DropdownTrigger
          aria-label={t('mobile_menu')}
          className={buttonVariants({
            variant: 'secondary',
            isIconOnly: true,
            className: 'flex size-10 items-center justify-center p-0 md:hidden'
          })}
        >
          <Bars3Icon className="h-5 w-5" />
        </DropdownTrigger>
        <DropdownPopover>
          <DropdownMenu>
            {navbarItems.map((item) => (
              <DropdownItem
                key={item.key}
                href={getNavbarHref(item.href)}
                className="justify-start text-left"
              >
                {t(item.key)}
              </DropdownItem>
            ))}
            <Separator />
            <DropdownItem
              key="create-invoice"
              className="text-secondary justify-start text-left"
              href={CREATE_INVOICE_PAGE}
            >
              {t('create_invoice')}
            </DropdownItem>
            <Separator />
            <DropdownItem
              href={LOGIN_PAGE}
              className="text-muted justify-start text-left"
              key="login"
            >
              {t('login')}
            </DropdownItem>
            <DropdownItem
              key="sign-up"
              href={SIGN_UP_PAGE}
              className="text-muted justify-start text-left"
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
          <AppBrand wordmarkClassName="hidden sm:flex" />
        </Link>

        <div className="hidden gap-4 md:flex">
          {navbarItems.map((item) => {
            const isActive = pathname?.includes(item.href);

            return (
              <div key={item.key} aria-current={isActive ? 'page' : undefined}>
                <Link
                  href={getNavbarHref(item.href)}
                  className={cn('text-foreground', {
                    'text-primary': isActive
                  })}
                >
                  {t(item.key)}
                </Link>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-3">
          {renderMobileNavbarContent()}
          <div className="hidden border-r pr-4 md:flex">
            <Link
              className={buttonVariants({ variant: 'secondary' })}
              href={CREATE_INVOICE_PAGE}
            >
              {t('create_invoice')}
            </Link>
          </div>
          <div className="hidden md:flex">
            <Link
              className={buttonVariants({ variant: 'ghost' })}
              href={LOGIN_PAGE}
            >
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
