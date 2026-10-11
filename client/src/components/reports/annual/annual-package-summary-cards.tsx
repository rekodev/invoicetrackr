import {
  BanknotesIcon,
  CalculatorIcon,
  ClockIcon,
  ReceiptPercentIcon
} from '@heroicons/react/24/outline';
import type { AnnualPackageSummary } from '@invoicetrackr/types';
import { getLocale, getTranslations } from 'next-intl/server';

import MetricCard from '@/components/ui/metric-card';
import { formatMoney } from '@/lib/utils/currency';

type Props = { summary: AnnualPackageSummary; year: number };

const AnnualPackageSummaryCards = async ({ summary, year }: Props) => {
  const t = await getTranslations('reports.annual.cards');
  const locale = await getLocale();

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        icon={<BanknotesIcon className="h-4 w-4" />}
        iconVariant="success"
        title={t('income', { year })}
        text={formatMoney(summary.income, locale)}
      />
      <MetricCard
        icon={<ReceiptPercentIcon className="h-4 w-4" />}
        iconVariant="warning"
        title={t('expenses', { year })}
        text={formatMoney(summary.expenses, locale)}
      />
      <MetricCard
        icon={<ClockIcon className="h-4 w-4" />}
        iconVariant="warning"
        title={t('outstanding', { year })}
        text={formatMoney(summary.outstanding, locale)}
      />
      <MetricCard
        icon={<CalculatorIcon className="h-4 w-4" />}
        iconVariant="accent"
        title={t('tax')}
        text={
          summary.taxTotal === null
            ? t('not_available')
            : formatMoney(summary.taxTotal, locale)
        }
      />
    </div>
  );
};

export default AnnualPackageSummaryCards;
