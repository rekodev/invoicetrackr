import { auth } from "@/auth";
import InvoiceTable from "@/components/invoice/InvoiceTable";

const InvoicesPage = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  const userId = Number(session.user.id);
  const currency = session.user.currency;

  return <InvoiceTable currency={currency} userId={userId} />;
};

export default InvoicesPage;
