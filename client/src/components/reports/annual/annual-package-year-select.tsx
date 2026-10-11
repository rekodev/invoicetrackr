'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { annualPackageHref } from '@/lib/utils/annual-package';

import YearSelect from '../year-select';

type Props = { year: number; years: number[] };

const AnnualPackageYearSelect = ({ year, years }: Props) => {
  const t = useTranslations('reports.annual');
  const router = useRouter();

  return (
    <YearSelect
      label={t('year')}
      year={year}
      years={years}
      onChange={(next) => router.push(annualPackageHref(next))}
    />
  );
};

export default AnnualPackageYearSelect;
