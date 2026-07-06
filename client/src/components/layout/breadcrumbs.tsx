'use client';

import {
  BreadcrumbsItem,
  Breadcrumbs as HeroUIBreadcrumbs
} from '@heroui/react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import {
  HOME_PAGE,
  ONBOARDING_PAGE,
  VERIFY_EMAIL_PAGE
} from '@/lib/constants/pages';

const splitPathnameToSegments = (pathname: string): Array<string> => {
  return pathname.slice(1).split('/');
};

const Breadcrumbs = () => {
  const t = useTranslations('breadcrumbs');
  const pathname = usePathname();

  const renderBreadcrumbs = () => {
    if (!pathname) return null;
    if (pathname === HOME_PAGE) {
      return <BreadcrumbsItem>Home</BreadcrumbsItem>;
    }

    return splitPathnameToSegments(pathname).map((segment) => {
      const splitSegments = segment.split('-');
      const joinedSegments = splitSegments.join('_');

      if (splitSegments.length > 1) {
        return (
          <BreadcrumbsItem key={segment}>{t(joinedSegments)}</BreadcrumbsItem>
        );
      }

      return (
        <BreadcrumbsItem key={segment}>
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
    <HeroUIBreadcrumbs className="pb-6" isDisabled>
      {renderBreadcrumbs()}
    </HeroUIBreadcrumbs>
  );
};

export default Breadcrumbs;
