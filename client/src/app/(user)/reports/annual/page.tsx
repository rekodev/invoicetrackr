import { Alert } from '@heroui/react';
import { unauthorized } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { auth } from '@/auth';
import AnnualPackageWorkspace from '@/components/reports/annual/annual-package-workspace';
import AnnualPackageYearSelect from '@/components/reports/annual/annual-package-year-select';
import PageHeader from '@/components/ui/page-header';
import { AnnualPackageSkeleton } from '@/components/ui/skeletons/annual-package-skeleton';
import {
  currentJournalYear,
  journalYears,
  parseJournalQuery
} from '@/lib/utils/journal';

type SearchParams = Promise<{
  year?: string | string[];
  export_error?: string | string[];
}>;

export default async function AnnualPackagePage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user?.id) unauthorized();

  const t = await getTranslations('reports.annual');
  const currentYear = currentJournalYear();
  const params = await searchParams;
  const { year } = parseJournalQuery(params, currentYear);

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title={t('heading')} description={t('description')}>
        <AnnualPackageYearSelect
          year={year}
          years={journalYears(currentYear, year)}
        />
      </PageHeader>
      {params.export_error && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{t('export_error.title')}</Alert.Title>
            <Alert.Description>{t('export_error.description')}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}
      <Suspense key={year} fallback={<AnnualPackageSkeleton />}>
        <AnnualPackageWorkspace userId={Number(session.user.id)} year={year} />
      </Suspense>
    </section>
  );
}
