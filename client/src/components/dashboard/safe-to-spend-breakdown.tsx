import type { DashboardSafeToSpend } from '@invoicetrackr/types';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';

import { formatMoney } from '@/lib/utils/currency';
import { dashboardLinks, yearRange } from '@/lib/utils/dashboard';
import { taxEstimateHref } from '@/lib/utils/tax';

type Props = { safeToSpend: DashboardSafeToSpend; year: number };

type Row = {
  key: string;
  hint?: string;
  amount?: string;
  href?: string;
  subtract?: boolean;
};

const SafeToSpendBreakdown = async ({ safeToSpend, year }: Props) => {
  const t = await getTranslations('dashboard.safe_to_spend');
  const tMethods = await getTranslations('reports.taxes.methods');
  const locale = await getLocale();
  const range = yearRange(year);
  const isReady = safeToSpend.status === 'ready';

  const rows: Row[] = [
    {
      key: 'received_income',
      amount: safeToSpend.receivedIncome,
      href: dashboardLinks.receivedIncome(range)
    },
    ...(Number(safeToSpend.vatCollected) > 0
      ? [
          {
            key: 'vat_collected',
            amount: safeToSpend.vatCollected,
            subtract: true
          }
        ]
      : []),
    {
      key: 'expenses',
      amount: safeToSpend.expenses,
      href: dashboardLinks.expenses(range),
      subtract: true
    },
    isReady
      ? {
          key: 'tax_reserve',
          hint: tMethods(safeToSpend.expenseMethod),
          amount: safeToSpend.taxReserve,
          href: taxEstimateHref(year),
          subtract: true
        }
      : { key: 'tax_reserve' }
  ];

  return (
    <dl className="flex flex-col">
      {rows.map((row) => {
        const label = t(`rows.${row.key}`);
        const sign = row.subtract && Number(row.amount) > 0 ? '−' : '';
        const formatted =
          row.amount === undefined
            ? undefined
            : `${sign}${formatMoney(row.amount, locale)}`;

        return (
          <div
            key={row.key}
            className="flex justify-between gap-4 border-b py-1.5"
          >
            <dt className="text-muted">
              {label}
              {row.hint && <span className="block text-xs">{row.hint}</span>}
            </dt>
            <dd className="text-right tabular-nums">
              {formatted === undefined ? (
                <span className="text-muted">{t('not_set_up')}</span>
              ) : row.href ? (
                <Link
                  href={row.href}
                  aria-label={`${label}: ${formatted}`}
                  className="hover:underline"
                >
                  {formatted}
                </Link>
              ) : (
                formatted
              )}
            </dd>
          </div>
        );
      })}
      {isReady && (
        <div className="flex justify-between gap-4 py-1.5 font-medium">
          <dt>{t('rows.safe_to_spend')}</dt>
          <dd className="text-right tabular-nums">
            {formatMoney(safeToSpend.safeToSpend, locale)}
          </dd>
        </div>
      )}
    </dl>
  );
};

export default SafeToSpendBreakdown;
