'use client';

import {
  Breadcrumbs as HeroUIBreadcrumbs,
  BreadcrumbItem
} from '@heroui/react';
import { usePathname } from 'next/navigation';

import {
  HOME_PAGE,
  ONBOARDING_PAGE,
  PAYMENT_SUCCESS_PAGE,
  RENEW_SUBSCRIPTION_PAGE
} from '@/lib/constants/pages';
import { capitalize } from '@/lib/utils';

const splitPathnameToSegments = (pathname: string): Array<string> => {
  return pathname.slice(1).split('/');
};

const Breadcrumbs = () => {
  const pathname = usePathname();

  const renderBreadcrumbs = () => {
    if (!pathname) return null;
    if (pathname === HOME_PAGE) {
      return <BreadcrumbItem>Home</BreadcrumbItem>;
    }

    return splitPathnameToSegments(pathname).map((segment) => {
      const splitSegments = segment.split('-');
      const joinedSegments = splitSegments
        .map((segment) => capitalize(segment))
        .join(' ');

      if (splitSegments.length > 1) {
        return <BreadcrumbItem key={segment}>{joinedSegments}</BreadcrumbItem>;
      }

      return (
        <BreadcrumbItem key={segment}>{capitalize(segment)}</BreadcrumbItem>
      );
    });
  };

  if (
    !pathname ||
    pathname.startsWith(PAYMENT_SUCCESS_PAGE) ||
    pathname.startsWith(ONBOARDING_PAGE) ||
    pathname.startsWith(RENEW_SUBSCRIPTION_PAGE)
  )
    return null;

  return (
    <HeroUIBreadcrumbs className="pb-6" isDisabled>
      {renderBreadcrumbs()}
    </HeroUIBreadcrumbs>
  );
};

export default Breadcrumbs;
