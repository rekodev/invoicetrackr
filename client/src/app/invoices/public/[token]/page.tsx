import { getTranslations } from 'next-intl/server';

import { confirmPublicInvoicePayment, getPublicInvoice } from '@/api/invoice';
import PublicInvoicePageContent from '@/components/invoice/public-invoice-page-content';
import { isResponseError } from '@/lib/utils/error';

type Params = Promise<{ token: string }>;
type SearchParams = Promise<{
  payment?: string;
  session_id?: string;
}>;

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PublicInvoicePage({
  params,
  searchParams
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { token } = await params;
  const { payment, session_id: sessionId } = await searchParams;
  const t = await getTranslations('invoice_signing');

  if (payment === 'success' && sessionId) {
    await confirmPublicInvoicePayment({ token, sessionId });
  }

  let response = await getPublicInvoice(token);

  if (
    payment === 'success' &&
    !sessionId &&
    !isResponseError(response) &&
    response.data.publicInvoice.payment.checkoutSessionId &&
    !response.data.publicInvoice.payment.completedAt
  ) {
    await confirmPublicInvoicePayment({
      token,
      sessionId: response.data.publicInvoice.payment.checkoutSessionId
    });
    response = await getPublicInvoice(token);
  }

  if (isResponseError(response))
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-xl items-center px-4 py-12">
        <section className="border-default-200 w-full rounded-lg border bg-white p-6 shadow-sm dark:bg-black">
          <h1 className="text-xl font-semibold">{t('link_unavailable')}</h1>
          <p className="text-muted mt-2 text-sm">
            {response.data.message}
          </p>
        </section>
      </main>
    );

  return (
    <PublicInvoicePageContent publicInvoice={response.data.publicInvoice} />
  );
}
