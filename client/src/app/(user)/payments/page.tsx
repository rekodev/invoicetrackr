import { BanknotesIcon } from '@heroicons/react/24/outline';
import { getTranslations } from 'next-intl/server';

import EmptyState from '@/components/empty-state';
import PageHeader from '@/components/ui/page-header';

export default async function PaymentsPage() {
  const t = await getTranslations('payments.empty');
  return (
    <section className="flex flex-col gap-section">
      <PageHeader title={t('heading')} />
      <EmptyState title={t('title')} description={t('description')} action={<BanknotesIcon className="text-muted size-10" aria-hidden="true" />} />
    </section>
  );
}
