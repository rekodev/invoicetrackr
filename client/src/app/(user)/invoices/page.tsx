import { DocumentArrowDownIcon, PlusIcon } from '@heroicons/react/24/outline';
import { buttonVariants } from '@heroui/react';
import Link from 'next/link';
import { unauthorized } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { auth } from '@/auth';
import PageHeader from '@/components/ui/page-header';
import { InvoiceTableSkeleton } from '@/components/ui/skeletons/invoice-skeleton';
import { ADD_NEW_INVOICE_PAGE, REPORTS_JOURNAL_PAGE } from '@/lib/constants/pages';
import { parseInvoiceListQuery } from '@/lib/utils/invoice-navigation';

import InvoicesPageContent from './invoices-page-content';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const InvoicesPage = async ({ searchParams }: Props) => {
  const session = await auth();
  if (!session?.user?.id) unauthorized();

  const query = parseInvoiceListQuery(await searchParams);
  const t = await getTranslations('invoices.top_content');
  const tBreadcrumbs = await getTranslations('breadcrumbs');

  return (
    <section className="flex flex-col gap-section">
      <PageHeader title={tBreadcrumbs('invoices')}>
        <Link
          href={REPORTS_JOURNAL_PAGE}
          className={buttonVariants({ variant: 'secondary', size: 'md' })}
        >
          <DocumentArrowDownIcon className="h-4 w-4" />
          {t('journal')}
        </Link>
        <Link href={ADD_NEW_INVOICE_PAGE} className={buttonVariants({ size: 'md' })}>
          <PlusIcon className="h-4 w-4" />
          {t('add_new')}
        </Link>
      </PageHeader>
      <Suspense fallback={<InvoiceTableSkeleton />}>
        <InvoicesPageContent
          userId={Number(session.user.id)}
          query={query}
          isEmailVerified={Boolean(session.user.emailVerifiedAt)}
          preferredLanguage={
            session.user.preferredInvoiceLanguage || session.user.language
          }
        />
      </Suspense>
    </section>
  );
};

export default InvoicesPage;
