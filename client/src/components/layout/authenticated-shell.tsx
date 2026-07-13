'use client';

import {
  ArrowRightStartOnRectangleIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import {
  Avatar,
  Button,
  cn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownPopover,
  DropdownTrigger,
  Separator
} from '@heroui/react';
import type { User } from '@invoicetrackr/types';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { type ReactNode, useEffect, useRef, useState } from 'react';

import { logOutAction } from '@/lib/actions';
import {
  ONBOARDING_PAGE,
  PERSONAL_INFORMATION_PAGE
} from '@/lib/constants/pages';

import LanguageSwitcher from './language-switcher';
import MobileSidebar from './mobile-sidebar';
import Sidebar from './sidebar';
import ThemeSwitcher from './theme-switcher';

export default function AuthenticatedShell({
  user,
  children
}: {
  user: User;
  children: ReactNode;
}) {
  const t = useTranslations('header.user');
  const pathname = usePathname();
  const isOnboarding = pathname === ONBOARDING_PAGE;
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isMobileNavigationOpen = isMobileOpen && !isOnboarding;
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileDrawerRef = useRef<HTMLElement>(null);
  const closeMobileNavigation = () => {
    setIsMobileOpen(false);
    menuTriggerRef.current?.focus();
  };

  useEffect(() => {
    if (!isMobileNavigationOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusable = mobileDrawerRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    focusable?.item(0)?.focus();

    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileOpen(false);
        menuTriggerRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab' || !focusable?.length) return;
      const first = focusable.item(0);
      const last = focusable.item(focusable.length - 1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => {
      document.removeEventListener('keydown', handleKeyboard);
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileNavigationOpen]);

  const accountMenu = (
    <Dropdown>
      <DropdownTrigger aria-label={t('a11y.profile_actions_label')}>
        <Avatar className="cursor-pointer">
          <Avatar.Image
            alt={user.name || user.email || 'User'}
            src={user.profilePictureUrl}
          />
          <Avatar.Fallback>
            {(user.name || user.email || 'U').slice(0, 2).toUpperCase()}
          </Avatar.Fallback>
        </Avatar>
      </DropdownTrigger>
      <DropdownPopover>
        <form action={logOutAction}>
          <DropdownMenu aria-label={t('a11y.profile_actions_label')}>
            <DropdownItem key="email" textValue={user.email || ''}>
              <span className="text-muted block max-w-56 truncate text-sm">
                {user.email}
              </span>
            </DropdownItem>
            <DropdownItem key="profile" href={PERSONAL_INFORMATION_PAGE}>
              {t('my_profile')}
            </DropdownItem>
            <DropdownItem key="logout" onPress={logOutAction} variant="danger">
              <span className="flex items-center gap-2">
                <ArrowRightStartOnRectangleIcon className="size-4" />
                {t('log_out')}
              </span>
            </DropdownItem>
          </DropdownMenu>
        </form>
      </DropdownPopover>
    </Dropdown>
  );

  return (
    <div className="flex min-h-[calc(100vh-1px)] w-full">
      {!isOnboarding ? <Sidebar /> : null}
      {isMobileNavigationOpen && (
        <MobileSidebar
          mobileDrawerRef={mobileDrawerRef}
          onClose={closeMobileNavigation}
        />
      )}
      <div className="min-w-0 flex-1">
        <header
          className={cn(
            'border-default-200 bg-background/90 sticky top-0 z-40 flex h-16 items-center border-b px-4 backdrop-blur md:justify-end md:px-6',
            isOnboarding ? 'justify-end' : 'justify-between'
          )}
        >
          {!isOnboarding ? (
            <Button
              ref={menuTriggerRef}
              isIconOnly
              variant="ghost"
              className="md:hidden"
              aria-label={t('a11y.open_navigation')}
              onPress={() => setIsMobileOpen(true)}
            >
              <Bars3Icon className="size-5" />
            </Button>
          ) : null}
          <div className="flex items-center gap-2">
            <LanguageSwitcher user={user} />
            <ThemeSwitcher />
            <Separator
              orientation="vertical"
              className="mx-1 h-auto self-stretch"
            />
            {accountMenu}
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
