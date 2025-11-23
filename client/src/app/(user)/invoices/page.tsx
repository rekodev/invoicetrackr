import { Suspense } from 'react';

import { InvoiceTableSkeleton } from '@/components/ui/skeletons/invoice';

import InvoicesPageContent from './invoices-page-content';

const InvoicesPage = async () => {
  return (
    <Suspense fallback={<InvoiceTableSkeleton />}>
      <InvoicesPageContent />
    </Suspense>
  );
};

export default InvoicesPage;
