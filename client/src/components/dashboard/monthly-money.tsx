import { Card } from '@heroui/react';
import type { DashboardMonth } from '@invoicetrackr/types';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';

import { formatMoney } from '@/lib/utils/currency';
import {
  dashboardLinks,
  monthRange,
  subtractMoney,
  yearRange
} from '@/lib/utils/dashboard';

import MonthlyMoneyChart from './monthly-money-chart';

type Props = {
  year: number;
  monthly: DashboardMonth[];
  totals: { receivedIncome: string; expenses: string; deductibleExpenses: string };
};

const cell = 'px-2 py-1.5';

const MonthlyMoney = async ({ year, monthly, totals }: Props) => {
  const t = await getTranslations('dashboard.monthly');
  const locale = await getLocale();
  const range = yearRange(year);
  const monthName = new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' });
  const rows = monthly.map((month) => ({
    ...month,
    name: monthName.format(new Date(Date.UTC(year, month.month - 1, 1))),
    range: monthRange(year, month.month),
    net: subtractMoney(month.receivedIncome, month.expenses)
  }));
  const figures = [
    {
      key: 'expenses',
      amount: totals.expenses,
      href: dashboardLinks.expenses(range)
    },
    {
      key: 'deductible_expenses',
      amount: totals.deductibleExpenses,
      href: dashboardLinks.deductibleExpenses(range)
    }
  ];

  return (
    <Card className="min-w-0 border">
      <Card.Header className="flex-row flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-medium">{t('title')}</h2>
          <p className="text-muted text-sm">{t('subtitle', { year })}</p>
        </div>
        <dl className="flex flex-wrap gap-x-6 gap-y-2">
          {figures.map((figure) => (
            <div key={figure.key} className="min-w-0">
              <dt className="text-muted text-xs font-medium">{t(`summary.${figure.key}`)}</dt>
              <dd className="text-sm font-semibold tabular-nums">
                <Link
                  href={figure.href}
                  aria-label={`${t(`summary.${figure.key}`)}: ${formatMoney(figure.amount, locale)}`}
                  className="hover:underline"
                >
                  {formatMoney(figure.amount, locale)}
                </Link>
              </dd>
            </div>
          ))}
        </dl>
      </Card.Header>
      <Card.Content className="flex flex-col gap-6">
        <MonthlyMoneyChart
          labels={rows.map((row) => row.name)}
          income={rows.map((row) => row.receivedIncome)}
          expenses={rows.map((row) => row.expenses)}
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="text-muted border-b">
              <tr>
                <th scope="col" className={`${cell} font-medium`}>{t('columns.month')}</th>
                <th scope="col" className={`${cell} text-right font-medium`}>{t('columns.income')}</th>
                <th scope="col" className={`${cell} text-right font-medium`}>{t('columns.expenses')}</th>
                <th scope="col" className={`${cell} text-right font-medium`}>{t('columns.net')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.month} className="border-b last:border-0">
                  <th scope="row" className={`${cell} font-normal capitalize`}>{row.name}</th>
                  <td className={`${cell} text-right tabular-nums`}>
                    <Link
                      href={dashboardLinks.receivedIncome(row.range)}
                      aria-label={`${t('a11y.income_link', { month: row.name })}: ${formatMoney(row.receivedIncome, locale)}`}
                      className="hover:underline"
                    >
                      {formatMoney(row.receivedIncome, locale)}
                    </Link>
                  </td>
                  <td className={`${cell} text-right tabular-nums`}>
                    <Link
                      href={dashboardLinks.expenses(row.range)}
                      aria-label={`${t('a11y.expenses_link', { month: row.name })}: ${formatMoney(row.expenses, locale)}`}
                      className="hover:underline"
                    >
                      {formatMoney(row.expenses, locale)}
                    </Link>
                  </td>
                  <td className={`${cell} text-right tabular-nums`}>{formatMoney(row.net, locale)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-default border-t font-semibold">
              <tr>
                <th scope="row" className="px-2 py-2">{t('total')}</th>
                <td className="px-2 py-2 text-right tabular-nums">{formatMoney(totals.receivedIncome, locale)}</td>
                <td className="px-2 py-2 text-right tabular-nums">{formatMoney(totals.expenses, locale)}</td>
                <td className="px-2 py-2 text-right tabular-nums">
                  {formatMoney(subtractMoney(totals.receivedIncome, totals.expenses), locale)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card.Content>
    </Card>
  );
};

export default MonthlyMoney;
