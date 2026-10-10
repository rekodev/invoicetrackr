import { Alert } from '@heroui/react';
import { unauthorized } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { auth } from '@/auth';
import JournalFilters from '@/components/reports/journal-filters';
import JournalGuide from '@/components/reports/journal-guide';
import JournalWorkspace from '@/components/reports/journal-workspace';
import { JournalSkeleton } from '@/components/ui/skeletons/journal-skeleton';
import { currentJournalYear, parseJournalQuery } from '@/lib/utils/journal';

type SearchParams = Promise<{
  year?: string | string[];
  month?: string | string[];
  export_error?: string | string[];
}>;

export default async function ReportsPage({
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
    <section className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold">{t('heading')}</h1>
          <p className="text-muted mt-1 max-w-2xl text-sm">{t('description')}</p>
        </div>
        <JournalFilters query={query} currentYear={currentYear} />
      </header>
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
      <JournalGuide />
    </section>
  );
}
