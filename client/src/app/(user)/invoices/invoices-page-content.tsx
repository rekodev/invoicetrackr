import { getInvoices } from '@/api/invoice';
import { auth } from '@/auth';
import InvoiceTable from '@/components/invoice/invoice-table';
import { isResponseError } from '@/lib/utils/error';

export default async function InvoicesPageContent() {
  const session = await auth();

  if (!session?.user?.id) return null;

  const userId = Number(session.user.id);

  const invoicesResp = await getInvoices(userId);

  if (isResponseError(invoicesResp)) throw new Error('Failed to fetch data');

  return <InvoiceTable invoices={invoicesResp.data.invoices} userId={userId} />;
}
