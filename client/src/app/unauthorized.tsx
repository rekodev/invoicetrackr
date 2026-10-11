'use client';

import { HomeIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { buttonVariants } from '@heroui/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import StatusMessage from '@/components/ui/status-message';
import { HOME_PAGE } from '@/lib/constants/pages';

export default function Unauthorized() {
  const t = useTranslations('unauthorized');

  return (
    <StatusMessage
      icon={ShieldExclamationIcon}
      tone="warning"
      title={t('title')}
      description={t('description')}
      action={
        <Link
          href={HOME_PAGE}
          className={buttonVariants({ variant: 'ghost', className: 'gap-2' })}
        >
          <HomeIcon className="size-4" />
          {t('go_home')}
        </Link>
      }
    />
  );
}
