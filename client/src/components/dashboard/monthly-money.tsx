import { buttonVariants, Card } from '@heroui/react';
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
import { formatMonthName } from '@/lib/utils/date';
import { journalHref } from '@/lib/utils/journal';

import MonthlyMoneyChart from './monthly-money-chart';

type Props = {
  year: number;
  monthly: DashboardMonth[];
  totals: { receivedIncome: string; expenses: string; deductibleExpenses: string };
};

const cell = 'px-2 py-1.5';
const footerCell = 'bg-default px-2 py-2';
const footerAmountCell = `${footerCell} text-right tabular-nums`;

const MonthlyMoney = async ({ year, monthly, totals }: Props) => {
  const t = await getTranslations('dashboard.monthly');
  const locale = await getLocale();
  const range = yearRange(year);
  const rows = monthly.map((month) => ({
    ...month,
    name: formatMonthName(year, month.month, locale),
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
      <Card.Header className="flex-row flex-wrap items-center justify-between gap-field">
        <h2 className="text-base font-medium">{t('title')}</h2>
        <dl className="flex flex-wrap gap-x-section gap-y-actions">
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
        <Link
          href={journalHref({ year })}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          {t('journal')}
        </Link>
      </Card.Header>
      <Card.Content className="flex flex-col gap-section">
        <MonthlyMoneyChart
          labels={rows.map((row) => row.name)}
          income={rows.map((row) => row.receivedIncome)}
          expenses={rows.map((row) => row.expenses)}
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-separate border-spacing-0 text-left text-sm">
            <thead className="text-muted [&_th]:border-b">
              <tr>
                <th scope="col" className={`${cell} font-medium`}>{t('columns.month')}</th>
                <th scope="col" className={`${cell} text-right font-medium`}>{t('columns.income')}</th>
                <th scope="col" className={`${cell} text-right font-medium`}>{t('columns.expenses')}</th>
                <th scope="col" className={`${cell} text-right font-medium`}>{t('columns.net')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.month} className="[&>*]:border-b [&:last-child>*]:border-0">
                  <th scope="row" className={`${cell} font-normal capitalize`}>
                    <Link
                      href={journalHref({ year, month: row.month })}
                      aria-label={t('a11y.journal_link', { month: row.name })}
                      className="hover:underline"
                    >
                      {row.name}
                    </Link>
                  </th>
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
            <tfoot className="font-semibold">
              <tr>
                <th scope="row" className={`${footerCell} rounded-l-xl`}>{t('total')}</th>
                <td className={footerAmountCell}>{formatMoney(totals.receivedIncome, locale)}</td>
                <td className={footerAmountCell}>{formatMoney(totals.expenses, locale)}</td>
                <td className={`${footerAmountCell} rounded-r-xl`}>
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
