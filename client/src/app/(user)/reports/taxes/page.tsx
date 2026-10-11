import { unauthorized } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { auth } from '@/auth';
import TaxEstimateWorkspace from '@/components/reports/taxes/tax-estimate-workspace';
import TaxYearSelect from '@/components/reports/taxes/tax-year-select';
import PageHeader from '@/components/ui/page-header';
import { TaxEstimateSkeleton } from '@/components/ui/skeletons/tax-estimate-skeleton';
import { currentJournalYear, parseJournalQuery } from '@/lib/utils/journal';
import { taxYears } from '@/lib/utils/tax';

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
    <section className="flex flex-col gap-6">
      <PageHeader title={t('heading')} description={t('description')}>
        <TaxYearSelect year={year} years={taxYears(year)} />
      </PageHeader>
      <Suspense key={year} fallback={<TaxEstimateSkeleton />}>
        <TaxEstimateWorkspace userId={Number(session.user.id)} year={year} />
      </Suspense>
    </section>
  );
}
