import { unauthorized } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { auth } from '@/auth';
import AddClientButton from '@/components/client/add-client-button';
import PageHeader from '@/components/ui/page-header';
import { ClientSectionSkeleton } from '@/components/ui/skeletons/client-skeleton';

import ClientsPageContent from './clients-page-content';

const ClientsPage = async () => {
  const session = await auth();
  if (!session?.user?.id) unauthorized();

  const userId = Number(session.user.id);
  const t = await getTranslations('breadcrumbs');

  return (
    <section className="flex flex-col gap-section">
      <PageHeader title={t('clients')}>
        <AddClientButton userId={userId} />
      </PageHeader>
      <Suspense fallback={<ClientSectionSkeleton />}>
        <ClientsPageContent userId={userId} />
      </Suspense>
    </section>
  );
};

export default ClientsPage;
