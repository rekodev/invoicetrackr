'use client';

import {
  Breadcrumbs as HeroUIBreadcrumbs,
  BreadcrumbsItem
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
      return <BreadcrumbsItem href={HOME_PAGE}>Home</BreadcrumbsItem>;
    }

    return splitPathnameToSegments(pathname).map((segment, index, segments) => {
      const splitSegments = segment.split('-');
      const joinedSegments = splitSegments.join('_');
      const href = `/${segments.slice(0, index + 1).join('/')}`;

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
    <HeroUIBreadcrumbs className="pb-6" isDisabled>
      {renderBreadcrumbs()}
    </HeroUIBreadcrumbs>
  );
};

export default Breadcrumbs;
