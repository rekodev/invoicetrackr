import { notFound } from 'next/navigation';

import { getPublicInvoiceSigning } from '@/api/invoice';
import { isResponseError } from '@/lib/utils/error';

import InvoiceSigningPageContent from './invoice-signing-page-content';

type Params = Promise<{ token: string }>;

export default async function InvoiceSigningPage({
  params
}: {
  params: Params;
}) {
  const { token } = await params;
  const response = await getPublicInvoiceSigning(token);

  if (isResponseError(response)) notFound();

  return <InvoiceSigningPageContent signing={response.data.signing} />;
}
