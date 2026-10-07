import { buttonVariants, Card, Chip } from '@heroui/react';
import type { DashboardOverdueInvoice } from '@invoicetrackr/types';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';

import EmptyState from '@/components/empty-state';
import { INVOICE_WORKSPACE_PAGE } from '@/lib/constants/pages';
import { formatMoney } from '@/lib/utils/currency';
import { dashboardLinks } from '@/lib/utils/dashboard';
import { formatLocalizedDate } from '@/lib/utils/date';

import OverdueReminderButton from './overdue-reminder-button';

type Props = {
  userId: number;
  invoices: DashboardOverdueInvoice[];
  overdueCount: number;
  overdueTotal: string;
  isEmailVerified: boolean;
};

const headerCell = 'px-2 py-3 font-medium';
const bodyCell = 'px-2 py-3';

const OverdueInvoices = async ({
  userId,
  invoices,
  overdueCount,
  overdueTotal,
  isEmailVerified
}: Props) => {
  const t = await getTranslations('dashboard.overdue');
  const locale = await getLocale();

  return (
    <Card className="min-w-0 border">
      <Card.Header className="flex-row flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-medium">{t('title')}</h2>
          {overdueCount > 0 ? (
            <p className="text-muted text-sm">
              {t('summary', {
                count: overdueCount,
                amount: formatMoney(overdueTotal, locale)
              })}
            </p>
          ) : null}
        </div>
        {overdueCount > 0 ? (
          <Link
            href={dashboardLinks.overdue()}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            {t('view_all')}
          </Link>
        ) : null}
      </Card.Header>
      <Card.Content>
        {invoices.length === 0 ? (
          <EmptyState
            className="min-h-[160px]"
            title={t('empty.title')}
            description={t('empty.description')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-muted border-b">
                <tr>
                  <th scope="col" className={headerCell}>{t('columns.invoice')}</th>
                  <th scope="col" className={headerCell}>{t('columns.client')}</th>
                  <th scope="col" className={`${headerCell} text-right`}>{t('columns.outstanding')}</th>
                  <th scope="col" className={headerCell}>{t('columns.due_date')}</th>
                  <th scope="col" className={headerCell}>{t('columns.days_overdue')}</th>
                  <th scope="col" className={`${headerCell} text-right`}>{t('columns.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => {
                  const label = invoice.invoiceId || t('no_number');
                  return (
                    <tr key={invoice.id} className="border-b last:border-0">
                      <td className={`${bodyCell} font-medium`}>
                        <Link href={INVOICE_WORKSPACE_PAGE(invoice.id)} className="hover:underline">
                          {label}
                        </Link>
                      </td>
                      <td className={bodyCell}>{invoice.clientName}</td>
                      <td className={`${bodyCell} text-right tabular-nums`}>
                        {formatMoney(invoice.outstandingAmount, locale)}
                      </td>
                      <td className={bodyCell}>{formatLocalizedDate(invoice.dueDate, locale)}</td>
                      <td className={bodyCell}>
                        <Chip size="sm" variant="soft" color="danger" className="tabular-nums">
                          {t('days', { count: invoice.daysOverdue })}
                        </Chip>
                      </td>
                      <td className={`${bodyCell} text-right`}>
                        <OverdueReminderButton
                          userId={userId}
                          invoiceId={invoice.id}
                          invoiceLabel={label}
                          isEmailVerified={isEmailVerified}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card.Content>
    </Card>
  );
};

export default OverdueInvoices;
