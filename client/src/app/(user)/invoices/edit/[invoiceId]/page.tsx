import { getClients, getInvoice, getUser } from '@/api';
import { auth } from '@/auth';
import InvoiceForm from '@/components/invoice/invoice-form';

type Params = Promise<{ invoiceId: string }>;

const EditInvoicePage = async ({ params }: { params: Params }) => {
  const { invoiceId } = await params;
  const session = await auth();

  if (!session?.user?.id) return null;

  const numericUserId = Number(session.user.id);

  const response = await getInvoice(numericUserId, Number(invoiceId));
  const { data: user } = await getUser(numericUserId);
  const {
    data: { clients }
  } = await getClients(numericUserId);

  return (
    <section>
      <InvoiceForm
        user={user}
        clients={clients}
        currency={session.user.currency}
        invoiceData={response.data.invoice}
      />
    </section>
  );
};

export default EditInvoicePage;
