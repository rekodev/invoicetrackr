'use client';

import { HomeIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { Button } from '@heroui/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { HOME_PAGE } from '@/lib/constants/pages';

export default function Unauthorized() {
  const t = useTranslations('unauthorized');

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 text-center">
        <div className="bg-warning/10 flex items-center justify-center rounded-full p-4">
          <ShieldExclamationIcon className="text-warning size-8" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-default-500">{t('description')}</p>
        </div>

        <Button as={Link} href={HOME_PAGE} variant="ghost" className="gap-2">
          <HomeIcon className="size-4" />
          {t('go_home')}
        </Button>
      </div>
    </div>
  );
}
