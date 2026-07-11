'use client';

import { buttonVariants } from '@heroui/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { INVOICES_PAGE } from '@/lib/constants/pages';

export default function ViewAllInvoicesButton() {
  const t = useTranslations('dashboard.latest_invoices');

  return (
    <Link
      href={INVOICES_PAGE}
      className={buttonVariants({
        variant: 'outline',
        size: 'sm',
        className: 'w-full justify-center sm:w-auto'
      })}
    >
      {t('view_all')}
    </Link>
  );
}
