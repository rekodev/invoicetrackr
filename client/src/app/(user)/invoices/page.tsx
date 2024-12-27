import { auth } from '@/auth';
import Invoices from '@/components/invoice/invoices';

const InvoicesPage = async () => {
  const session = await auth();
  const userId = Number(session?.user?.id);

  if (!userId) return null;

  return <Invoices userId={userId} />;
};

export default InvoicesPage;
