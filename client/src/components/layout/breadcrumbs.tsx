'use client';

import {
  Breadcrumbs as HeroUIBreadcrumbs,
  BreadcrumbsItem
} from '@heroui/react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import {
  EXPENSES_PAGE,
  HOME_PAGE,
  ONBOARDING_PAGE,
  VERIFY_EMAIL_PAGE
} from '@/lib/constants/pages';
import { safeExpenseReturnTo } from '@/lib/utils/expense-navigation';

const splitPathnameToSegments = (pathname: string): Array<string> => {
  return pathname.slice(1).split('/');
};

const Breadcrumbs = () => {
  const t = useTranslations('breadcrumbs');
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const renderBreadcrumbs = () => {
    if (!pathname) return null;
    if (pathname === HOME_PAGE) {
      return <BreadcrumbsItem href={HOME_PAGE}>Home</BreadcrumbsItem>;
    }

    return splitPathnameToSegments(pathname).map((segment, index, segments) => {
      const splitSegments = segment.split('-');
      const joinedSegments = splitSegments.join('_');
      const segmentPath = `/${segments.slice(0, index + 1).join('/')}`;
      const href = segmentPath === EXPENSES_PAGE && segments.length === 2
        ? safeExpenseReturnTo(searchParams.get('returnTo') ?? undefined)
        : segmentPath;

      if (splitSegments.length > 1) {
        return (
          <BreadcrumbsItem key={href} href={href}>
            {t(joinedSegments)}
          </BreadcrumbsItem>
        );
      }

      return (
        <BreadcrumbsItem key={href} href={href}>
          {isNaN(Number(segment)) ? t(segment) : segment}
        </BreadcrumbsItem>
      );
    });
  };

  if (
    !pathname ||
    pathname.startsWith(ONBOARDING_PAGE) ||
    pathname.startsWith(VERIFY_EMAIL_PAGE)
  )
    return null;

  return (
    <HeroUIBreadcrumbs className="min-w-0 flex-1 overflow-hidden">
      {renderBreadcrumbs()}
    </HeroUIBreadcrumbs>
  );
};

export default Breadcrumbs;
