import { getInvoicesRevenue } from "@/api";
import { isResponseError } from "@/lib/utils/error";
import { getTranslations } from "next-intl/server";

import InvoiceDataBarChart from "./invoice-data-bar-chart";

type Props = {
  userId: number;
};

const RevenueChart = async ({ userId }: Props) => {
  const t = await getTranslations('dashboard.revenue_chart');
  const response = await getInvoicesRevenue(userId);

  if (isResponseError(response)) throw new Error('Failed to fetch data');

  return (
    <div className="flex flex-col gap-6 w-full">
      <h2 className="text-2xl">{t('title')}</h2>
      <InvoiceDataBarChart revenueByMonth={response.data.revenueByMonth} />
    </div>
  );
};

export default RevenueChart;
