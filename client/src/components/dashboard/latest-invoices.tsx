import { getLocale, getTranslations } from 'next-intl/server';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

import { Currency } from '@/lib/types/currency';
import { INVOICES_PAGE } from '@/lib/constants/pages';
import { getCurrencySymbol } from '@/lib/utils/currency';
import { getLatestInvoices } from '@/api/invoice';
import { isResponseError } from '@/lib/utils/error';

type Props = {
  userId: number;
  currency: Currency;
};

type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'canceled';

const LatestInvoices = async ({ userId, currency }: Props) => {
  const t = await getTranslations('dashboard.latest_invoices');
  const locale = await getLocale();
  const response = await getLatestInvoices(userId);

  if (isResponseError(response)) throw new Error('Failed to fetch data');

  const { invoices } = response.data;
  const currentTimestamp = new Date().getTime();
  const currencyFormatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short'
  });

  return (
    <section className="border-default-200 w-full min-w-72 rounded-xl border p-5 shadow-sm sm:p-6 xl:max-w-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">{t('title')}</h2>
          <p className="text-default-500 mt-1 text-sm">{t('subtitle')}</p>
        </div>
        <Link
          href={INVOICES_PAGE}
          className="border-default-200 text-default-500 hover:border-secondary hover:text-foreground inline-flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs transition"
        >
          {t('view_all')}
          <ArrowUpRightIcon className="h-3.5 w-3.5" />
        </Link>
      </div>

      {invoices.length ? (
        <ul className="divide-default-200 mt-4 divide-y">
          {invoices.map((invoice) => {
            const isOverdue =
              invoice.status === 'pending' &&
              new Date(invoice.dueDate).getTime() < currentTimestamp;
            const status: InvoiceStatus = isOverdue
              ? 'overdue'
              : (invoice.status as InvoiceStatus);
            const color =
              status === 'paid'
                ? 'success'
                : status === 'pending'
                  ? 'warning'
                  : 'danger';

            return (
              <li
                key={invoice.id}
                className="flex items-center gap-3 py-3.5 first:pt-2 last:pb-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">
                      {invoice.name}
                    </span>
                    <span
                      className={`inline-flex h-5 shrink-0 items-center rounded-full px-2 text-[11px] font-medium ${
                        color === 'success'
                          ? 'bg-success-100 text-success-700 dark:bg-success-50/20 dark:text-success-400'
                          : color === 'warning'
                            ? 'bg-warning-100 text-warning-700 dark:bg-warning-50/20 dark:text-warning-400'
                            : 'bg-danger-100 text-danger-700 dark:bg-danger-50/20 dark:text-danger-400'
                      }`}
                    >
                      {t(`statuses.${status}`)}
                    </span>
                  </div>
                  <div className="text-default-500 mt-0.5 flex min-w-0 items-center gap-1.5 text-[11px]">
                    <span className="shrink-0 tabular-nums">
                      {invoice.invoiceId}
                    </span>
                    <span aria-hidden>·</span>
                    <span className="shrink-0">
                      {dateFormatter.format(new Date(invoice.date))}
                    </span>
                    {invoice.email && (
                      <>
                        <span aria-hidden>·</span>
                        <span className="truncate">{invoice.email}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="shrink-0 text-right text-sm font-semibold tabular-nums">
                  {getCurrencySymbol(currency)}
                  {currencyFormatter.format(Number(invoice.totalAmount))}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-default-400 py-8 text-sm">{t('empty_state')}</p>
      )}
    </section>
  );
};

export default LatestInvoices;
