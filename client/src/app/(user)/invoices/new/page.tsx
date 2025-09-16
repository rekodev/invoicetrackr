import { getBankingInformationEntries, getClients, getUser } from '@/api';
import { auth } from '@/auth';
import InvoiceForm from '@/components/invoice/invoice-form';

const AddNewInvoicePage = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  const numericUserId = Number(session.user.id);

  const { data: user } = await getUser(numericUserId);
  const [clientsResp, bankingInformationEntriesResp] = await Promise.all([
    getClients(numericUserId),
    getBankingInformationEntries(numericUserId)
  ]);

  return (
    <section className="w-full">
      <InvoiceForm
        user={user}
        bankingInformationEntries={bankingInformationEntriesResp.data}
        currency={session.user.currency}
        clients={clientsResp.data.clients}
      />
    </section>
  );
};

export default AddNewInvoicePage;
