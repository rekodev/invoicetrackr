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

  const t = await getTranslations('breadcrumbs');

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title={t('clients')}>
        <AddClientButton userId={Number(session.user.id)} />
      </PageHeader>
      <Suspense fallback={<ClientSectionSkeleton />}>
        <ClientsPageContent />
      </Suspense>
    </section>
  );
};

export default ClientsPage;
