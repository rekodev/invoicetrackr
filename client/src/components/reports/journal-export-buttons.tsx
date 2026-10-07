import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { buttonVariants } from '@heroui/react';
import type { JournalQuery } from '@invoicetrackr/types';
import { getTranslations } from 'next-intl/server';

import { JOURNAL_EXPORT_FORMATS } from '@/lib/constants/journal';
import { journalExportHref } from '@/lib/utils/journal';

type Props = { query: JournalQuery };

const JournalExportButtons = async ({ query }: Props) => {
  const t = await getTranslations('reports.journal');

  return (
    <div role="group" aria-label={t('a11y.export')} className="flex flex-wrap gap-2">
      {JOURNAL_EXPORT_FORMATS.map((format) => (
        <a
          key={format}
          href={journalExportHref(query, format)}
          download
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          {t(`export.${format}`)}
        </a>
      ))}
    </div>
  );
};

export default JournalExportButtons;
