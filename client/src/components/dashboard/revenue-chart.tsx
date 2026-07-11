import { Card } from '@heroui/react';
import { getTranslations } from 'next-intl/server';

import { getInvoicesRevenue } from '@/api/invoice';
import { auth } from '@/auth';
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
    <section className="w-full">
      <Card className="w-full border">
        <Card.Header>
          <Card.Title className="text-base font-semibold">
            {t('title')}
          </Card.Title>
        </Card.Header>
        <Card.Content>
          <InvoiceDataBarChart
            revenueByMonth={response.data.revenueByMonth}
            currency={session?.user.currency}
          />
        </Card.Content>
      </Card>
    </section>
  );
};

export default RevenueChart;
