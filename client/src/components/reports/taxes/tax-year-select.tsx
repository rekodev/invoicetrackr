'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { taxEstimateHref } from '@/lib/utils/tax';

import YearSelect from '../year-select';

type Props = { year: number; years: number[] };

const TaxYearSelect = ({ year, years }: Props) => {
  const t = useTranslations('reports.taxes');
  const router = useRouter();

  return (
    <YearSelect
      label={t('year')}
      year={year}
      years={years}
      onChange={(next) => router.push(taxEstimateHref(next))}
    />
  );
};

export default TaxYearSelect;
