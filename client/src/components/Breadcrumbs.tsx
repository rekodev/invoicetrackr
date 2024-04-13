'use client';

import {
  Breadcrumbs as NextUIBreadcrumbs,
  BreadcrumbItem,
} from '@nextui-org/react';
import { usePathname } from 'next/navigation';

import { HOME_PAGE } from '@/constants/pages';
import { capitalize } from '@/utils';

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

    return splitPathnameToSegments(pathname).map((segment) => (
      <BreadcrumbItem key={segment}>{capitalize(segment)}</BreadcrumbItem>
    ));
  };

  return (
    <NextUIBreadcrumbs className='pb-6' isDisabled>
      {renderBreadcrumbs()}
    </NextUIBreadcrumbs>
  );
};

export default Breadcrumbs;
