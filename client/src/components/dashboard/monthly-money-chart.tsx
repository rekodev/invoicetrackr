'use client';

import { CategoryScale } from 'chart.js';
import Chart from 'chart.js/auto';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Bar } from 'react-chartjs-2';

import { formatMoney } from '@/lib/utils/currency';

Chart.register(CategoryScale);

type Props = {
  labels: string[];
  income: string[];
  expenses: string[];
};

const MonthlyMoneyChart = ({ labels, income, expenses }: Props) => {
  const t = useTranslations('dashboard.monthly');
  const locale = useLocale();
  const accentRef = useRef<HTMLSpanElement>(null);
  const warningRef = useRef<HTMLSpanElement>(null);
  const [colors, setColors] = useState<{ income?: string; expenses?: string }>({});

  useEffect(() => {
    if (!accentRef.current || !warningRef.current) return;

    setColors({
      income: getComputedStyle(accentRef.current).color,
      expenses: getComputedStyle(warningRef.current).color
    });
  }, []);

  const dataset = (label: string, values: string[], color?: string) => ({
    label,
    data: values.map(Number),
    backgroundColor: color,
    hoverBackgroundColor: color,
    borderRadius: 4
  });

  return (
    <div className="h-56 w-full">
      <span ref={accentRef} className="text-accent hidden" />
      <span ref={warningRef} className="text-warning hidden" />
      <Bar
        aria-label={t('chart_label')}
        role="img"
        data={{
          labels,
          datasets: [
            dataset(t('columns.income'), income, colors.income),
            dataset(t('columns.expenses'), expenses, colors.expenses)
          ]
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { boxHeight: 10, boxWidth: 22 } },
            tooltip: {
              callbacks: {
                label: (item) =>
                  `${item.dataset.label}: ${formatMoney(Number(item.raw), locale)}`
              }
            }
          }
        }}
      />
    </div>
  );
};

export default MonthlyMoneyChart;
