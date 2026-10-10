import { unauthorized } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { auth } from '@/auth';
import ReportsTabs from '@/components/reports/reports-tabs';
import TaxEstimateWorkspace from '@/components/reports/taxes/tax-estimate-workspace';
import TaxYearSelect from '@/components/reports/taxes/tax-year-select';
import { TaxEstimateSkeleton } from '@/components/ui/skeletons/tax-estimate-skeleton';
import {
  currentJournalYear,
  journalYears,
  parseJournalQuery
} from '@/lib/utils/journal';

type SearchParams = Promise<{ year?: string | string[] }>;

export default async function TaxesPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user?.id) unauthorized();

  const t = await getTranslations('reports.taxes');
  const currentYear = currentJournalYear();
  const { year } = parseJournalQuery(await searchParams, currentYear);

  return (
    <section className="flex flex-col gap-5">
      <ReportsTabs active="taxes" />
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold">{t('heading')}</h1>
          <p className="text-muted mt-1 max-w-2xl text-sm">{t('description')}</p>
        </div>
        <TaxYearSelect year={year} years={journalYears(currentYear, year)} />
      </header>
      <Suspense key={year} fallback={<TaxEstimateSkeleton />}>
        <TaxEstimateWorkspace userId={Number(session.user.id)} year={year} />
      </Suspense>
    </section>
  );
}
