import { Alert, Separator, Toolbar } from '@heroui/react';
import { unauthorized } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { auth } from '@/auth';
import AnnualPackageDownload from '@/components/reports/annual/annual-package-download';
import AnnualPackageStatusChip from '@/components/reports/annual/annual-package-status-chip';
import TaxYearSelect from '@/components/reports/taxes/tax-year-select';
import TaxesWorkspace from '@/components/reports/taxes/taxes-workspace';
import PageHeader from '@/components/ui/page-header';
import { TaxEstimateSkeleton } from '@/components/ui/skeletons/tax-estimate-skeleton';
import {
  currentJournalYear,
  journalYears,
  parseJournalQuery
} from '@/lib/utils/journal';

type SearchParams = Promise<{
  year?: string | string[];
  export_error?: string | string[];
}>;

export default async function TaxesPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user?.id) unauthorized();

  const t = await getTranslations('reports.taxes');
  const tExport = await getTranslations('reports.annual.export_error');
  const currentYear = currentJournalYear();
  const params = await searchParams;
  const { year } = parseJournalQuery(params, currentYear);

  return (
    <section className="flex flex-col gap-section">
      <PageHeader
        title={t('heading')}
        titleAddon={
          <Suspense key={year} fallback={null}>
            <AnnualPackageStatusChip
              userId={Number(session.user.id)}
              year={year}
            />
          </Suspense>
        }
      >
        <Toolbar isAttached aria-label={t('actions')} className="bg-transparent p-0 shadow-none">
          <TaxYearSelect year={year} years={journalYears(currentYear, year)} />
          <Separator orientation="vertical" />
          <AnnualPackageDownload year={year} />
        </Toolbar>
      </PageHeader>
      {params.export_error && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{tExport('title')}</Alert.Title>
            <Alert.Description>{tExport('description')}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}
      <Suspense key={year} fallback={<TaxEstimateSkeleton />}>
        <TaxesWorkspace userId={Number(session.user.id)} year={year} />
      </Suspense>
    </section>
  );
}
