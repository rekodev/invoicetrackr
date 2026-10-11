'use client';

import { Button } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import EmptyState from '@/components/empty-state';

import TaxAssumptionsDialog from './tax-assumptions-dialog';

type Props = { userId: number; year: number };

const TaxSetupPrompt = ({ userId, year }: Props) => {
  const t = useTranslations('reports.taxes.setup');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <EmptyState
        className="rounded-3xl border"
        title={t('title', { year })}
        description={t('description')}
        action={
          <Button size="sm" onPress={() => setIsOpen(true)}>
            {t('action')}
          </Button>
        }
      />
      <TaxAssumptionsDialog
        userId={userId}
        year={year}
        profile={null}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default TaxSetupPrompt;
