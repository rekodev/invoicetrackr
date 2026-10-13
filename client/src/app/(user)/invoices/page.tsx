import { DocumentArrowDownIcon, PlusIcon } from '@heroicons/react/24/outline';
import { buttonVariants } from '@heroui/react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import PageHeader from '@/components/ui/page-header';
import { InvoiceTableSkeleton } from '@/components/ui/skeletons/invoice-skeleton';
import { ADD_NEW_INVOICE_PAGE, REPORTS_JOURNAL_PAGE } from '@/lib/constants/pages';

import InvoicesPageContent from './invoices-page-content';

const InvoicesPage = async () => {
  const t = await getTranslations('invoices.top_content');
  const tBreadcrumbs = await getTranslations('breadcrumbs');

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title={tBreadcrumbs('invoices')}>
        <div className="flex flex-wrap gap-2">
          <Link
            href={REPORTS_JOURNAL_PAGE}
            className={buttonVariants({ variant: 'secondary', size: 'sm' })}
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            {t('journal')}
          </Link>
          <Link
            href={ADD_NEW_INVOICE_PAGE}
            className={buttonVariants({ size: 'sm' })}
          >
            <PlusIcon className="h-4 w-4" />
            {t('add_new')}
          </Link>
        </div>
      </PageHeader>
      <Suspense fallback={<InvoiceTableSkeleton />}>
        <InvoicesPageContent />
      </Suspense>
    </section>
  );
};

export default InvoicesPage;
