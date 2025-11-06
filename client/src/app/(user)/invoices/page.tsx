import InvoiceTable from '@/components/invoice/invoice-table';
import { auth } from '@/auth';
import { getInvoices } from '@/api';
import { isResponseError } from '@/lib/utils/error';

const InvoicesPage = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  const userId = Number(session.user.id);
  const currency = session.user.currency;
  const language = session.user.language;

  const invoicesResp = await getInvoices(userId);

  if (isResponseError(invoicesResp)) throw new Error('Failed to fetch data');

  return (
    <InvoiceTable
      language={language}
      invoices={invoicesResp.data.invoices}
      currency={currency}
      userId={userId}
    />
  );
};

export default InvoicesPage;
