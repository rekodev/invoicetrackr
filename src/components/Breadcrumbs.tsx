'use client';

import {
  Breadcrumbs as NextUIBreadcrumbs,
  BreadcrumbItem,
} from '@nextui-org/react';
import { usePathname } from 'next/navigation';

import { capitalize } from '@/utils';

const breadcrumbsMap = (pathname: string): Array<string> => {
  return pathname.slice(1).split('/');
};

const Breadcrumbs = () => {
  const pathname = usePathname();

  return (
    <NextUIBreadcrumbs className='pb-6' isDisabled>
      <BreadcrumbItem>Home</BreadcrumbItem>
      {breadcrumbsMap(pathname).map((param) => {
        return (
          <BreadcrumbItem key={pathname}>{capitalize(param)}</BreadcrumbItem>
        );
      })}
    </NextUIBreadcrumbs>
  );
};

export default Breadcrumbs;
