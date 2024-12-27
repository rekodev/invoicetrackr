import { getInvoicesRevenue } from '@/api';

import InvoiceDataBarChart from './invoice-data-bar-chart';

type Props = {
  userId: number;
};

const RevenueChart = async ({ userId }: Props) => {
  const response = await getInvoicesRevenue(userId);

  return (
    <div className='flex flex-col gap-6 w-full'>
      <h2 className='text-2xl'>Recent Revenue</h2>
      <InvoiceDataBarChart revenueByMonth={response.data.revenueByMonth} />
    </div>
  );
};

export default RevenueChart;
