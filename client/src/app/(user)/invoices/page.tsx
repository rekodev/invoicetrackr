import { auth } from '@/auth';
import InvoiceTable from '@/components/invoice/InvoiceTable';

const InvoicesPage = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  return <InvoiceTable userId={Number(session.user.id)} />;
};

export default InvoicesPage;
