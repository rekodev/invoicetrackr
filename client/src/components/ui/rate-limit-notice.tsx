'use client';

import { ArrowPathIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Button } from '@heroui/react';
import { useTranslations } from 'next-intl';

import StatusMessage from './status-message';

export default function RateLimitNotice() {
  const t = useTranslations('rate_limit');

  return (
    <StatusMessage
      icon={ClockIcon}
      tone="warning"
      title={t('title')}
      description={t('description')}
      action={
        <Button
          onPress={() => window.location.reload()}
          variant="ghost"
          className="gap-actions"
        >
          <ArrowPathIcon className="size-4" />
          {t('try_again')}
        </Button>
      }
    />
  );
}
