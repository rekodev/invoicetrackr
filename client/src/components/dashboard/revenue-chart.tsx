import { getTranslations } from 'next-intl/server';

import { auth } from '@/auth';
import { getInvoicesRevenue } from '@/api/invoice';
import { isResponseError } from '@/lib/utils/error';

import InvoiceDataBarChart from './invoice-data-bar-chart';

type Props = {
  userId: number;
};

const RevenueChart = async ({ userId }: Props) => {
  const t = await getTranslations('dashboard.revenue_chart');
  const session = await auth();
  const response = await getInvoicesRevenue(userId);

  if (isResponseError(response)) throw new Error('Failed to fetch data');

  return (
    <section className="border-default-200 flex w-full flex-col rounded-3xl border p-5 shadow-sm sm:p-6">
      <h2 className="text-base font-semibold">{t('title')}</h2>
      <InvoiceDataBarChart
        revenueByMonth={response.data.revenueByMonth}
        currency={session?.user.currency}
      />
    </section>
  );
};

export default RevenueChart;
