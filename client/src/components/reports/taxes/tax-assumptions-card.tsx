'use client';

import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { Button, Card } from '@heroui/react';
import type { TaxProfile } from '@invoicetrackr/types';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { formatMoney } from '@/lib/utils/currency';
import { formatLocalizedDate } from '@/lib/utils/date';

import TaxAssumptionsDialog from './tax-assumptions-dialog';

type Props = {
  userId: number;
  year: number;
  profile: TaxProfile;
  activeMonths: number;
};

const TaxAssumptionsCard = ({ userId, year, profile, activeMonths }: Props) => {
  const t = useTranslations('reports.taxes.assumptions');
  const tMethods = useTranslations('reports.taxes.methods');
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const formatPeriod = () => {
    const start = formatLocalizedDate(profile.activityStartDate, locale);
    const end = formatLocalizedDate(profile.activityEndDate, locale);

    if (start && end) return t('range', { start, end });
    if (start) return t('from', { date: start });
    if (end) return t('until', { date: end });
    return t('full_year');
  };
  const yesNo = (value: boolean) => (value ? t('yes') : t('no'));
  const details = [
    [t('expense_method'), tMethods(profile.expenseMethod)],
    [t('psd_coverage'), yesNo(profile.hasEmploymentPsdCoverage)],
    [t('pension'), yesNo(profile.hasAdditionalPensionAccumulation)],
    [t('activity_period'), `${formatPeriod()} · ${t('months', { count: activeMonths })}`],
    [t('other_income'), formatMoney(profile.otherDeclaredIncome, locale)]
  ];

  return (
    <Card className="border">
      <Card.Header className="flex-row flex-wrap items-center justify-between gap-4">
        <h2 className="text-base font-medium">{t('title', { year })}</h2>
        <Button size="sm" variant="outline" onPress={() => setIsOpen(true)}>
          <PencilSquareIcon className="size-4" />
          {t('edit')}
        </Button>
      </Card.Header>
      <Card.Content>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {details.map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-muted text-xs font-medium">{label}</dt>
              <dd className="text-sm">{value}</dd>
            </div>
          ))}
        </dl>
      </Card.Content>
      <TaxAssumptionsDialog
        userId={userId}
        year={year}
        profile={profile}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </Card>
  );
};

export default TaxAssumptionsCard;
