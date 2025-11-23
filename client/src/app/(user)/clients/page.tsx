import { Suspense } from 'react';

import { ClientSectionSkeleton } from '@/components/ui/skeletons/client';

import ClientsPageContent from './clients-page-content';

const ClientsPage = async () => {
  return (
    <Suspense fallback={<ClientSectionSkeleton />}>
      <ClientsPageContent />
    </Suspense>
  );
};

export default ClientsPage;
