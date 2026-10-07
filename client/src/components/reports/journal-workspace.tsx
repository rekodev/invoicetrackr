import { buttonVariants } from '@heroui/react';
import type { JournalQuery } from '@invoicetrackr/types';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';

import { getJournal } from '@/api/journal';
import EmptyState from '@/components/empty-state';
import { ADD_NEW_INVOICE_PAGE, EXPENSES_PAGE } from '@/lib/constants/pages';
import { isResponseError } from '@/lib/utils/error';
import { formatJournalPeriod } from '@/lib/utils/journal';

import JournalExportButtons from './journal-export-buttons';
import JournalSummaryCards from './journal-summary-cards';
import JournalTable from './journal-table';

type Props = { userId: number; query: JournalQuery };

const JournalWorkspace = async ({ userId, query }: Props) => {
  const t = await getTranslations('reports.journal');
  const locale = await getLocale();
  const response = await getJournal(userId, query);

  if (isResponseError(response)) throw new Error('Failed to fetch journal');

  const { rows, totals } = response.data;
  const period = formatJournalPeriod(query, locale);

  if (rows.length === 0) {
    return (
      <EmptyState
        className="rounded-3xl border"
        title={t('empty.title')}
        description={t('empty.description')}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Link href={ADD_NEW_INVOICE_PAGE} className={buttonVariants({ size: 'sm' })}>
              {t('empty.create_invoice')}
            </Link>
            <Link
              href={EXPENSES_PAGE}
              className={buttonVariants({ variant: 'secondary', size: 'sm' })}
            >
              {t('empty.add_expense')}
            </Link>
          </div>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <JournalSummaryCards totals={totals} period={period} />
      <JournalTable
        rows={rows}
        totals={totals}
        actions={<JournalExportButtons query={query} />}
      />
    </div>
  );
};

export default JournalWorkspace;
