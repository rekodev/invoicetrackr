'use client';

import {
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import StatusMessage from '@/components/ui/status-message';

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
    <StatusMessage
      icon={ExclamationTriangleIcon}
      tone="danger"
      title={t('title')}
      description={t('description')}
      action={
        <Button
          onPress={() => window.location.reload()}
          variant="ghost"
          className="gap-2"
        >
          <ArrowPathIcon className="size-4" />
          {t('try_again')}
        </Button>
      }
    />
  );
}
