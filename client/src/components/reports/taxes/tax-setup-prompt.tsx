'use client';

import { Button } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import EmptyState from '@/components/empty-state';

import TaxAssumptionsDialog from './tax-assumptions-dialog';

type Props = { userId: number; year: number };

const TaxSetupPrompt = ({ userId, year }: Props) => {
  const t = useTranslations('reports.taxes.setup');
  const tAssumptions = useTranslations('reports.taxes.assumptions');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="flex flex-col gap-heading">
      <h2 className="text-base font-medium">{tAssumptions('title')}</h2>
      <EmptyState
        className="border-y"
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
    </section>
  );
};

export default TaxSetupPrompt;
