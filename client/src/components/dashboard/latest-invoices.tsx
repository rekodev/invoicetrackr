import { Chip, buttonVariants } from '@heroui/react';
import { getLocale, getTranslations } from 'next-intl/server';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

import { ADD_NEW_INVOICE_PAGE, INVOICES_PAGE } from '@/lib/constants/pages';
import { Currency } from '@/lib/types/currency';
import EmptyState from '@/components/empty-state';
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
    <section className="border-default-200 w-full min-w-72 rounded-3xl border p-5 shadow-sm backdrop-blur-3xl sm:p-6 xl:max-w-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">{t('title')}</h2>
          <p className="text-default-500 mt-1 text-sm">{t('subtitle')}</p>
        </div>
        <Link
          href={INVOICES_PAGE}
          className={buttonVariants({ size: 'sm', variant: 'outline' })}
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
                    <Chip
                      size="sm"
                      color={color}
                      variant="soft"
                      className="h-5 shrink-0 text-[11px] font-medium"
                    >
                      {t(`statuses.${status}`)}
                    </Chip>
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
        <EmptyState
          className="min-h-[260px]"
          title={t('empty_state.title')}
          description={t('empty_state.description')}
          actionLabel={t('empty_state.action')}
          actionHref={ADD_NEW_INVOICE_PAGE}
        />
      )}
    </section>
  );
};

export default LatestInvoices;
