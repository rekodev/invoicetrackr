import { Alert } from '@heroui/react';
import { unauthorized } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { auth } from '@/auth';
import JournalFilters from '@/components/reports/journal-filters';
import JournalWorkspace from '@/components/reports/journal-workspace';
import PageHeader from '@/components/ui/page-header';
import { JournalSkeleton } from '@/components/ui/skeletons/journal-skeleton';
import { currentJournalYear, parseJournalQuery } from '@/lib/utils/journal';

type SearchParams = Promise<{
  year?: string | string[];
  month?: string | string[];
  export_error?: string | string[];
}>;

export default async function JournalPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user?.id) unauthorized();

  const t = await getTranslations('reports.journal');
  const currentYear = currentJournalYear();
  const params = await searchParams;
  const query = parseJournalQuery(params, currentYear);

  return (
    <section className="flex flex-col gap-section">
      <PageHeader title={t('heading')}>
        <JournalFilters query={query} currentYear={currentYear} />
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
      <Suspense
        key={`${query.year}-${query.month ?? 'all'}`}
        fallback={<JournalSkeleton />}
      >
        <JournalWorkspace userId={Number(session.user.id)} query={query} />
      </Suspense>
    </section>
  );
}
