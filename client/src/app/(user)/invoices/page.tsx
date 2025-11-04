import InvoiceTable from '@/components/invoice/invoice-table';
import { auth } from '@/auth';
import { getInvoices } from '@/api';

const InvoicesPage = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  const userId = Number(session.user.id);
  const currency = session.user.currency;
  const language = session.user.language;

  const invoicesResp = await getInvoices(userId);

  return (
    <InvoiceTable
      language={language}
      invoices={invoicesResp.data.invoices || []}
      currency={currency}
      userId={userId}
    />
  );
};

export default InvoicesPage;
