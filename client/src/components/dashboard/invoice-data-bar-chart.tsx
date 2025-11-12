'use client';

import { Bar } from 'react-chartjs-2';
import { CategoryScale } from 'chart.js';
import Chart from 'chart.js/auto';
import { useTranslations } from 'next-intl';

Chart.register(CategoryScale);

type Props = {
  revenueByMonth: Record<number, number> | undefined;
};

const InvoiceDataBarChart = ({ revenueByMonth }: Props) => {
  const t = useTranslations('dashboard.revenue_chart');

  const currentMonthIndex = new Date().getMonth();

  const MONTHS = [
    t('months.january'),
    t('months.february'),
    t('months.march'),
    t('months.april'),
    t('months.may'),
    t('months.june'),
    t('months.july'),
    t('months.august'),
    t('months.september'),
    t('months.october'),
    t('months.november'),
    t('months.december')
  ];

  const labels = MONTHS.slice(0, currentMonthIndex).concat(
    MONTHS.slice(currentMonthIndex)
  );

  const dataByMonth = revenueByMonth
    ? Object.values(revenueByMonth)
        .slice(0, currentMonthIndex)
        .concat(Object.values(revenueByMonth).slice(currentMonthIndex))
    : [];

  const data = {
    labels,
    datasets: [
      {
        label: t('chart_label'),
        data: dataByMonth,
        backgroundColor: '#71717A',
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const revenue = tooltipItem.raw;
            return `${t('revenue')}: $${revenue}`;
          }
        }
      }
    }
  };

  return (
    <div className="min-h-96 w-full">
      <Bar data={data} options={options} />
    </div>
  );
};

export default InvoiceDataBarChart;
