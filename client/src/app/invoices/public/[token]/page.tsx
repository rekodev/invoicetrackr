import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import PublicInvoicePageContent from '@/components/invoice/public-invoice-page-content';
import { getNoIndexMetadata } from '@/lib/seo/metadata';
import { getPublicInvoice } from '@/api/invoice';
import { isResponseError } from '@/lib/utils/error';

type Params = Promise<{ token: string }>;
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('invoice_signing');

  return getNoIndexMetadata({
    title: t('invoice')
  });
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PublicInvoicePage({
  params
}: {
  params: Params;
}) {
  const { token } = await params;
  const t = await getTranslations('invoice_signing');

  const response = await getPublicInvoice(token);

  if (isResponseError(response))
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-xl items-center px-4 py-12">
        <section className="border-default-200 w-full rounded-lg border bg-white p-6 shadow-sm dark:bg-black">
          <h1 className="text-xl font-semibold">{t('link_unavailable')}</h1>
          <p className="text-muted mt-2 text-sm">{response.data.message}</p>
        </section>
      </main>
    );

  return (
    <PublicInvoicePageContent publicInvoice={response.data.publicInvoice} />
  );
}
