'use client';

import { CategoryScale } from 'chart.js';
import Chart from 'chart.js/auto';
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
  'December',
];

type Props = {
  revenueByMonth: Record<number, number> | undefined;
};

const InvoiceDataBarChart = ({ revenueByMonth }: Props) => {
  const currentMonthIndex = new Date().getMonth();
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
        label: 'Revenue from invoices for the month',
        data: dataByMonth,
        backgroundColor: '#71717A',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className='w-full min-h-96'>
      <Bar
        data={data}
        options={{ responsive: true, maintainAspectRatio: false }}
      />
    </div>
  );
};

export default InvoiceDataBarChart;