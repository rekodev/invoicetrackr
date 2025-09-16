import {
  getBankingInformationEntries,
  getClients,
  getInvoice,
  getUser
} from '@/api';
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

  const [clientsResp, bankingInformationEntriesResp] = await Promise.all([
    getClients(numericUserId),
    getBankingInformationEntries(numericUserId)
  ]);

  return (
    <section>
      <InvoiceForm
        user={user}
        clients={clientsResp.data.clients}
        currency={session.user.currency}
        invoiceData={response.data.invoice}
        bankingInformationEntries={bankingInformationEntriesResp.data}
      />
    </section>
  );
};

export default EditInvoicePage;
