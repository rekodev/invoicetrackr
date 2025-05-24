import {
  BanknotesIcon,
  ClockIcon,
  DocumentCurrencyDollarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

import { getInvoicesTotalAmount } from '@/api';
import { Currency } from '@/lib/types/currency';
import { getCurrencySymbol } from '@/lib/utils/currency';

import DashboardCard from './dashboard-card';

type Props = {
  userId: number;
  currency: Currency;
};

const DashboardCards = async ({ userId, currency }: Props) => {
  const {
    data: { invoices, totalClients }
  } = await getInvoicesTotalAmount(userId);

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
        title={
          <div className="flex items-center gap-1">
            <BanknotesIcon className="h-5 w-5" />
            <h4>Paid</h4>
          </div>
        }
        text={`${currencySymbol}${totalInvoiceRevenue?.paid.toFixed(2) || '0'}`}
      />
      <DashboardCard
        title={
          <div className="flex items-center gap-1">
            <ClockIcon className="h-5 w-5" />
            <h4>Pending</h4>
          </div>
        }
        text={`${currencySymbol}${
          totalInvoiceRevenue?.pending.toFixed(2) || '0'
        }`}
      />
      <DashboardCard
        title={
          <div className="flex items-center gap-1">
            <DocumentCurrencyDollarIcon className="h-5 w-5" />
            <h4>Total Invoices</h4>
          </div>
        }
        text={`${invoices?.length || '0'}`}
      />
      <DashboardCard
        title={
          <div className="flex items-center gap-1">
            <UsersIcon className="h-5 w-5" />
            <h4>Total Clients</h4>
          </div>
        }
        text={`${totalClients || '0'}`}
      />
    </section>
  );
};

export default DashboardCards;
