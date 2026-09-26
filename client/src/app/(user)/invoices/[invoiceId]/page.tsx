import { notFound, unauthorized } from 'next/navigation';

import { getInvoiceWorkspace } from '@/api/invoice';
import { auth } from '@/auth';
import InvoiceWorkspace from '@/components/invoice/invoice-workspace-client';
import { isResponseError } from '@/lib/utils/error';

type Params = Promise<{ invoiceId: string }>;

export default async function InvoiceWorkspacePage({
  params
}: {
  params: Params;
}) {
  const session = await auth();
  if (!session?.user?.id) unauthorized();
  const { invoiceId } = await params;
  if (!/^[1-9]\d*$/.test(invoiceId)) notFound();
  const userId = Number(session.user.id);
  const response = await getInvoiceWorkspace(userId, Number(invoiceId));
  if (isResponseError(response)) {
    if (response.status === 404) notFound();
    throw new Error('Failed to load invoice workspace');
  }
  return (
    <InvoiceWorkspace
      userId={userId}
      data={response.data}
      isEmailVerified={Boolean(session.user.emailVerifiedAt)}
      preferredLanguage={
        session.user.preferredInvoiceLanguage || session.user.language
      }
    />
  );
}
