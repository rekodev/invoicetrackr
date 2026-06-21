import {
  BanknotesIcon,
  ClockIcon,
  DocumentCurrencyDollarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { getTranslations } from 'next-intl/server';

import { Currency } from '@/lib/types/currency';
import { getCurrencySymbol } from '@/lib/utils/currency';
import { getInvoicesTotalAmount } from '@/api/invoice';
import { isResponseError } from '@/lib/utils/error';

import DashboardCard from './dashboard-card';

type Props = {
  userId: number;
  currency: Currency;
};

const DashboardCards = async ({ userId, currency }: Props) => {
  const t = await getTranslations('dashboard.cards');
  const response = await getInvoicesTotalAmount(userId);

  if (isResponseError(response)) throw new Error('Failed to fetch data');

  const { invoices, totalClients } = response.data;

  const currencySymbol = getCurrencySymbol(currency);

  const totalInvoiceRevenue = invoices?.reduce<{
    pending: number;
    paid: number;
  }>(
    (acc, currentValue) => {
      if (currentValue.status === 'paid') {
        acc.paid += Number(currentValue.totalAmount);
      } else if (currentValue.status === 'pending') {
        acc.pending += Number(currentValue.totalAmount);
      }

      return acc;
    },
    { pending: 0, paid: 0 }
  );

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <DashboardCard
        icon={<BanknotesIcon className="h-4 w-4" />}
        iconClassName="bg-success/15 text-success"
        title={t('paid')}
        text={`${currencySymbol}${totalInvoiceRevenue?.paid.toFixed(2) || '0'}`}
      />
      <DashboardCard
        icon={<ClockIcon className="h-4 w-4" />}
        iconClassName="bg-warning/15 text-warning"
        title={t('pending')}
        text={`${currencySymbol}${
          totalInvoiceRevenue?.pending.toFixed(2) || '0'
        }`}
      />
      <DashboardCard
        icon={<DocumentCurrencyDollarIcon className="h-4 w-4" />}
        iconClassName="bg-accent/15 text-accent"
        title={t('total_invoices')}
        text={`${invoices?.length || '0'}`}
      />
      <DashboardCard
        icon={<UsersIcon className="h-4 w-4" />}
        iconClassName="bg-accent/15 text-accent"
        title={t('total_clients')}
        text={`${totalClients || '0'}`}
      />
    </section>
  );
};

export default DashboardCards;
