'use client';

import {
  Breadcrumbs as NextUIBreadcrumbs,
  BreadcrumbItem,
} from "@heroui/react";
import { usePathname } from 'next/navigation';

import { HOME_PAGE } from '@/lib/constants/pages';
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

  return (
    <NextUIBreadcrumbs className='pb-6' isDisabled>
      {renderBreadcrumbs()}
    </NextUIBreadcrumbs>
  );
};

export default Breadcrumbs;
