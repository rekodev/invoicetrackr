import { ChartBarSquareIcon } from '@heroicons/react/24/outline';
import { getTranslations } from 'next-intl/server';

import EmptyState from '@/components/empty-state';

export default async function ReportsPage() {
  const t = await getTranslations('reports.empty');
  return (
    <section>
      <h1 className="mb-6 text-3xl font-semibold">{t('heading')}</h1>
      <EmptyState title={t('title')} description={t('description')} action={<ChartBarSquareIcon className="text-muted size-10" aria-hidden="true" />} />
    </section>
  );
}
