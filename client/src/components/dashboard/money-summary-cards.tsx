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

  const cards = [
    {
      key: 'received_income',
      title: t('received_income', { year }),
      amount: totals.receivedIncome,
      href: dashboardLinks.receivedIncome(range),
      icon: <BanknotesIcon className="h-4 w-4" />,
      iconVariant: 'success' as const
    },
    {
      key: 'invoiced',
      title: t('invoiced', { year }),
      amount: totals.invoiced,
      href: dashboardLinks.invoiced(range),
      icon: <DocumentTextIcon className="h-4 w-4" />,
      iconVariant: 'accent' as const
    },
    {
      key: 'outstanding',
      title: t('outstanding'),
      amount: totals.outstanding,
      href: dashboardLinks.outstanding(),
      icon: <ClockIcon className="h-4 w-4" />,
      iconVariant: 'warning' as const
    }
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-3">
      {cards.map((card) => (
        <DashboardCard
          key={card.key}
          icon={card.icon}
          iconVariant={card.iconVariant}
          title={card.title}
          text={formatMoney(card.amount, locale)}
          href={card.href}
          linkLabel={t('a11y.view_records', { title: card.title })}
        />
      ))}
    </div>
  );
};

export default MoneySummaryCards;
