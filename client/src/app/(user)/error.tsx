'use client';

import {
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@heroui/react';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function Error({
  error
}: {
  error: Error & { digest?: string };
}) {
  const t = useTranslations('error_page');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 text-center">
        <div className="bg-danger/10 flex items-center justify-center rounded-full p-4">
          <ExclamationTriangleIcon className="text-danger size-8" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-default-500">{t('description')}</p>
        </div>

        <Button
          onPress={() => window.location.reload()}
          variant="ghost"
          className="gap-2"
        >
          <ArrowPathIcon className="size-4" />
          {t('try_again')}
        </Button>
      </div>
    </div>
  );
}
