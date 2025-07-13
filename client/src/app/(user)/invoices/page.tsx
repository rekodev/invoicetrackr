import { getInvoices } from '@/api';
import { auth } from '@/auth';
import InvoiceTable from '@/components/invoice/invoice-table';

const InvoicesPage = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  const userId = Number(session.user.id);
  const currency = session.user.currency;
  const language = session.user.language;

  const {
    data: { invoices }
  } = await getInvoices(userId);

  return (
    <InvoiceTable
      language={language}
      invoices={invoices || []}
      currency={currency}
      userId={userId}
    />
  );
};

export default InvoicesPage;
