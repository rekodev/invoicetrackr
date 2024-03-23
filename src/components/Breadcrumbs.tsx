'use client';

import {
  Breadcrumbs as NextUIBreadcrumbs,
  BreadcrumbItem,
} from '@nextui-org/react';

const Breadcrumbs = () => {
  return (
    <NextUIBreadcrumbs className='pb-6' isDisabled>
      <BreadcrumbItem>Home</BreadcrumbItem>
      <BreadcrumbItem>Invoices</BreadcrumbItem>
    </NextUIBreadcrumbs>
  );
};

export default Breadcrumbs;
