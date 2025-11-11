'use client';

import { Button, Link } from '@heroui/react';
import { useTranslations } from 'next-intl';

import { INVOICES_PAGE } from '@/lib/constants/pages';

export default function ViewAllInvoicesButton() {
  const t = useTranslations('dashboard.latest_invoices');
  
  return (
    <Button as={Link} variant="bordered" href={INVOICES_PAGE} size="sm">
      {t('view_all')}
    </Button>
  );
}
