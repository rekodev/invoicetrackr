import { buttonVariants } from '@heroui/react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { getDashboardSummary } from '@/api/dashboard';
import EmptyState from '@/components/empty-state';
import { ADD_NEW_INVOICE_PAGE, EXPENSES_PAGE } from '@/lib/constants/pages';
import { isResponseError } from '@/lib/utils/error';

import AttentionStrip from './attention-strip';
import MoneySummaryCards from './money-summary-cards';
import MonthlyMoney from './monthly-money';
import OverdueInvoices from './overdue-invoices';

type Props = { userId: number; isEmailVerified: boolean };

const MoneyWorkbench = async ({ userId, isEmailVerified }: Props) => {
  const t = await getTranslations('dashboard.empty');
  const response = await getDashboardSummary(userId);

  if (isResponseError(response)) throw new Error('Failed to fetch data');

  const summary = response.data;
  const hasRecords =
    Object.values(summary.totals).some((amount) => Number(amount) > 0) ||
    summary.attention.draftCount > 0 ||
    summary.attention.expensesMissingDocuments > 0;

  if (!hasRecords) {
    return (
      <EmptyState
        title={t('title')}
        description={t('description')}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Link href={ADD_NEW_INVOICE_PAGE} className={buttonVariants({ size: 'sm' })}>
              {t('create_invoice')}
            </Link>
            <Link
              href={EXPENSES_PAGE}
              className={buttonVariants({ variant: 'secondary', size: 'sm' })}
            >
              {t('add_expense')}
            </Link>
          </div>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <AttentionStrip
        attention={summary.attention}
        year={summary.year}
        isEmailVerified={isEmailVerified}
      />
      <MoneySummaryCards totals={summary.totals} year={summary.year} />
      <OverdueInvoices
        userId={userId}
        invoices={summary.overdueInvoices}
        overdueCount={summary.overdueCount}
        overdueTotal={summary.totals.overdue}
        isEmailVerified={isEmailVerified}
      />
      <MonthlyMoney
        year={summary.year}
        monthly={summary.monthly}
        totals={summary.totals}
      />
    </div>
  );
};

export default MoneyWorkbench;
