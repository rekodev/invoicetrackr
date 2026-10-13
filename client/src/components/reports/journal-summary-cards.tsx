import {
  BanknotesIcon,
  ReceiptPercentIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';
import type { JournalTotals } from '@invoicetrackr/types';
import { getLocale, getTranslations } from 'next-intl/server';

import MetricCard from '@/components/ui/metric-card';
import { formatMoney } from '@/lib/utils/currency';

type Props = { totals: JournalTotals };

const JournalSummaryCards = async ({ totals }: Props) => {
  const t = await getTranslations('reports.journal.cards');
  const locale = await getLocale();

  return (
    <div className="grid gap-section sm:grid-cols-3">
      <MetricCard
        icon={<BanknotesIcon className="h-4 w-4" />}
        iconVariant="success"
        title={t('income')}
        text={formatMoney(totals.income, locale)}
      />
      <MetricCard
        icon={<ReceiptPercentIcon className="h-4 w-4" />}
        iconVariant="warning"
        title={t('expenses')}
        text={formatMoney(totals.expenses, locale)}
      />
      <MetricCard
        icon={<ScaleIcon className="h-4 w-4" />}
        iconVariant="accent"
        title={t('net')}
        text={formatMoney(totals.net, locale)}
      />
    </div>
  );
};

export default JournalSummaryCards;
