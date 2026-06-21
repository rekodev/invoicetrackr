'use client';

import Link from 'next/link';
import { buttonVariants } from '@heroui/react';
import { useTranslations } from 'next-intl';

import { INVOICES_PAGE } from '@/lib/constants/pages';

export default function ViewAllInvoicesButton() {
  const t = useTranslations('dashboard.latest_invoices');

  return (
    <Link
      href={INVOICES_PAGE}
      className={buttonVariants({ variant: 'outline', size: 'sm' })}
    >
      {t('view_all')}
    </Link>
  );
}
