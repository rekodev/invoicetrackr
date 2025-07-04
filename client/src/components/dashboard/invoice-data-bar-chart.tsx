'use client';

import { CategoryScale } from 'chart.js';
import Chart from 'chart.js/auto';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Bar } from 'react-chartjs-2';

Chart.register(CategoryScale);

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

type Props = {
  revenueByMonth: Record<number, number> | undefined;
};

const InvoiceDataBarChart = ({ revenueByMonth }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const currentMonthIndex = new Date().getMonth();
  const labels = MONTHS.slice(0, currentMonthIndex).concat(
    MONTHS.slice(currentMonthIndex)
  );

  // useEffect(() => {
  //   // Temporary workaround for right after login
  //   if (pathname === LOGIN_PAGE) router.replace(DASHBOARD_PAGE);
  // }, [pathname, router]);

  const dataByMonth = revenueByMonth
    ? Object.values(revenueByMonth)
        .slice(0, currentMonthIndex)
        .concat(Object.values(revenueByMonth).slice(currentMonthIndex))
    : [];

  const data = {
    labels,
    datasets: [
      {
        label: 'Invoice Revenue by Month',
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
            return `Revenue: $${revenue}`;
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
