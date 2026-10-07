import { BanknotesIcon, ClockIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import type { DashboardTotals } from '@invoicetrackr/types';
import { getLocale, getTranslations } from 'next-intl/server';

import { formatMoney } from '@/lib/utils/currency';
import { dashboardLinks, yearRange } from '@/lib/utils/dashboard';

import DashboardCard from './dashboard-card';

type Props = { totals: DashboardTotals; year: number };

const MoneySummaryCards = async ({ totals, year }: Props) => {
  const t = await getTranslations('dashboard.cards');
  const locale = await getLocale();
  const range = yearRange(year);

  return (
    <section className="flex flex-col gap-3" aria-labelledby="money-summary-heading">
      <h2 id="money-summary-heading" className="section-eyebrow text-muted">
        {t('period', { year })}
      </h2>
      <div className="grid gap-5 sm:grid-cols-3">
        <DashboardCard
          icon={<BanknotesIcon className="h-4 w-4" />}
          iconVariant="success"
          title={t('received_income')}
          text={formatMoney(totals.receivedIncome, locale)}
          href={dashboardLinks.receivedIncome(range)}
          linkLabel={t('a11y.view_records', { title: t('received_income') })}
        />
        <DashboardCard
          icon={<DocumentTextIcon className="h-4 w-4" />}
          iconVariant="accent"
          title={t('invoiced')}
          text={formatMoney(totals.invoiced, locale)}
          href={dashboardLinks.invoiced(range)}
          linkLabel={t('a11y.view_records', { title: t('invoiced') })}
        />
        <DashboardCard
          icon={<ClockIcon className="h-4 w-4" />}
          iconVariant="warning"
          title={
            <>
              {t('outstanding')}
              <span className="font-normal">· {t('outstanding_scope')}</span>
            </>
          }
          text={formatMoney(totals.outstanding, locale)}
          href={dashboardLinks.outstanding()}
          linkLabel={t('a11y.view_records', {
            title: `${t('outstanding')} (${t('outstanding_scope')})`
          })}
        />
      </div>
    </section>
  );
};

export default MoneySummaryCards;
