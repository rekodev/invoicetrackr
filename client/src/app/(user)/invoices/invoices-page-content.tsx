import InvoiceTable from '@/components/invoice/invoice-table';
import { auth } from '@/auth';
import { getInvoices } from '@/api/invoice';
import { isResponseError } from '@/lib/utils/error';

export default async function InvoicesPageContent() {
  const session = await auth();

  if (!session?.user?.id) return null;

  const userId = Number(session.user.id);
  const currency = session.user.currency;
  const language = session.user.language;
  const userPreferredInvoiceLanguage = session.user.preferredInvoiceLanguage;

  const invoicesResp = await getInvoices(userId);

  if (isResponseError(invoicesResp)) throw new Error('Failed to fetch data');

  return (
    <InvoiceTable
      language={language}
      userPreferredInvoiceLanguage={userPreferredInvoiceLanguage}
      invoices={invoicesResp.data.invoices}
      currency={currency}
      userId={userId}
    />
  );
}
