import { BanknotesIcon } from '@heroicons/react/24/outline';
import { getTranslations } from 'next-intl/server';

import EmptyState from '@/components/empty-state';

export default async function PaymentsPage() {
  const t = await getTranslations('payments.empty');
  return (
    <section>
      <h1 className="mb-6 text-3xl font-semibold">{t('heading')}</h1>
      <EmptyState title={t('title')} description={t('description')} action={<BanknotesIcon className="text-muted size-10" aria-hidden="true" />} />
    </section>
  );
}
