'use client';

import { useEffect, useRef, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { CategoryScale } from 'chart.js';
import Chart from 'chart.js/auto';
import { useTranslations } from 'next-intl';

import { Currency } from '@/lib/types/currency';
import { getCurrencySymbol } from '@/lib/utils/currency';

Chart.register(CategoryScale);

type Props = {
  currency: Currency | undefined;
  revenueByMonth: Record<number, number> | undefined;
};

const InvoiceDataBarChart = ({ revenueByMonth, currency }: Props) => {
  const t = useTranslations('dashboard.revenue_chart');
  const accentRef = useRef<HTMLSpanElement>(null);
  const gridRef = useRef<HTMLSpanElement>(null);
  const tickRef = useRef<HTMLSpanElement>(null);
  const [accentColor, setAccentColor] = useState<string>();

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
        backgroundColor: accentColor,
        hoverBackgroundColor: accentColor,
        borderColor: accentColor,
        borderRadius: 6,
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          boxHeight: 10,
          boxWidth: 22,
          font: {
            size: 12,
            weight: 500
          },
          useBorderRadius: true,
          borderRadius: 2
        }
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const revenue = tooltipItem.raw;
            return `${t('revenue')}: ${getCurrencySymbol(currency)}${revenue}`;
          }
        }
      }
    }
  };

  useEffect(() => {
    if (!accentRef.current || !gridRef.current || !tickRef.current) return;

    setAccentColor(getComputedStyle(accentRef.current).color);
  }, []);

  return (
    <div className="min-h-96 w-full">
      <span ref={accentRef} className="text-accent hidden" />
      <span ref={gridRef} className="text-muted hidden" />
      <span ref={tickRef} className="text-muted hidden" />
      <Bar data={data} options={options} />
    </div>
  );
};

export default InvoiceDataBarChart;
