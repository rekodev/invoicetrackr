import { PlusIcon } from '@heroicons/react/24/outline';
import { buttonVariants } from '@heroui/react';
import type { JournalQuery } from '@invoicetrackr/types';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { getJournal } from '@/api/journal';
import EmptyState from '@/components/empty-state';
import { ADD_NEW_INVOICE_PAGE, EXPENSES_PAGE } from '@/lib/constants/pages';
import { isResponseError } from '@/lib/utils/error';

import JournalExportButtons from './journal-export-buttons';
import JournalGuide from './journal-guide';
import JournalSummaryCards from './journal-summary-cards';
import JournalTable from './journal-table';

type Props = { userId: number; query: JournalQuery };

const JournalWorkspace = async ({ userId, query }: Props) => {
  const t = await getTranslations('reports.journal');
  const response = await getJournal(userId, query);

  if (isResponseError(response)) throw new Error('Failed to fetch journal');

  const { rows, totals } = response.data;

  if (rows.length === 0) {
    return (
      <EmptyState
        className="rounded-3xl border"
        title={t('empty.title')}
        description={t('empty.description')}
        action={
          <div className="flex flex-wrap justify-center gap-actions">
            <Link href={ADD_NEW_INVOICE_PAGE} className={buttonVariants({ size: 'sm' })}>
              <PlusIcon className="h-4 w-4" />
              {t('empty.create_invoice')}
            </Link>
            <Link
              href={EXPENSES_PAGE}
              className={buttonVariants({ variant: 'secondary', size: 'sm' })}
            >
              <PlusIcon className="h-4 w-4" />
              {t('empty.add_expense')}
            </Link>
          </div>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-section">
      <JournalSummaryCards totals={totals} />
      <JournalTable
        rows={rows}
        totals={totals}
        actions={<JournalExportButtons query={query} />}
        info={<JournalGuide />}
      />
    </div>
  );
};

export default JournalWorkspace;
