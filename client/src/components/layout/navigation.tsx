'use client';

import {
  AdjustmentsHorizontalIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  ChartBarSquareIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  HomeIcon,
  IdentificationIcon,
  KeyIcon,
  ReceiptPercentIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { Accordion, Link } from '@heroui/react';
import { cn } from '@heroui/styles';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { ComponentType, ReactNode, SVGProps } from 'react';

import {
  ACCOUNT_SETTINGS_PAGE,
  BANKING_INFORMATION_PAGE,
  CHANGE_PASSWORD_PAGE,
  CLIENTS_PAGE,
  DASHBOARD_PAGE,
  EXPENSES_PAGE,
  INVOICES_PAGE,
  PAYMENTS_PAGE,
  PERSONAL_INFORMATION_PAGE,
  PROFILE_PAGE,
  REPORTS_PAGE
} from '@/lib/constants/pages';

type NavLink = {
  key: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  children?: Array<NavLink>;
};

const navigation: Array<NavLink> = [
  { key: 'dashboard', href: DASHBOARD_PAGE, icon: HomeIcon },
  { key: 'invoices', href: INVOICES_PAGE, icon: DocumentTextIcon },
  { key: 'clients', href: CLIENTS_PAGE, icon: UserGroupIcon },
  { key: 'payments', href: PAYMENTS_PAGE, icon: BanknotesIcon },
  { key: 'expenses', href: EXPENSES_PAGE, icon: ReceiptPercentIcon },
  { key: 'reports', href: REPORTS_PAGE, icon: ChartBarSquareIcon },
  {
    key: 'settings',
    href: PROFILE_PAGE,
    icon: Cog6ToothIcon,
    children: [
      {
        key: 'personal_information',
        href: PERSONAL_INFORMATION_PAGE,
        icon: IdentificationIcon
      },
      {
        key: 'banking_information',
        href: BANKING_INFORMATION_PAGE,
        icon: BuildingLibraryIcon
      },
      {
        key: 'account_settings',
        href: ACCOUNT_SETTINGS_PAGE,
        icon: AdjustmentsHorizontalIcon
      },
      {
        key: 'change_password',
        href: CHANGE_PASSWORD_PAGE,
        icon: KeyIcon
      }
    ]
  }
];

export const isCurrentPath = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

type Props = {
  isMobile?: boolean;
  onCloseMobileSidebar?: () => void;
};

export default function Navigation({ isMobile, onCloseMobileSidebar }: Props) {
  const t = useTranslations('header.user');
  const pathname = usePathname();

  const renderNavLink = (item: NavLink): ReactNode => {
    const isActive = isCurrentPath(pathname, item.href);

    return (
      <Link
        key={item.key}
        href={item.href}
        aria-current={isActive ? 'page' : undefined}
        onClick={() => isMobile && onCloseMobileSidebar?.()}
        className={cn(
          'text-muted hover:bg-accent/10 hover:text-accent flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium no-underline outline-none transition-colors focus-visible:ring-2',
          isActive && 'bg-accent/10 text-accent'
        )}
      >
        <item.icon className="size-5" aria-hidden="true" />
        {t(item.key)}
      </Link>
    );
  };

  const renderNavItem = (item: NavLink): ReactNode => {
    if (!item.children?.length) return renderNavLink(item);

    const isActive = isCurrentPath(pathname, item.href);

    return (
      <Accordion
        key={item.key}
        defaultExpandedKeys={isActive ? [item.key] : []}
        className="w-full"
      >
        <Accordion.Item key={item.key} id={item.key}>
          <Accordion.Heading>
            <Accordion.Trigger
              className={cn(
                'text-muted hover:bg-accent/10 hover:text-accent flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2',
                isActive && 'text-accent'
              )}
            >
              <item.icon className="size-5" aria-hidden="true" />
              <span className="flex-1 text-left">{t(item.key)}</span>
              <Accordion.Indicator />
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <Accordion.Body className="flex flex-col gap-1 pl-4 pt-1">
              {item.children.map(renderNavItem)}
            </Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    );
  };

  return (
    <nav
      aria-label={t('a11y.primary_navigation')}
      className="flex flex-col gap-1"
    >
      {navigation.map(renderNavItem)}
    </nav>
  );
}
