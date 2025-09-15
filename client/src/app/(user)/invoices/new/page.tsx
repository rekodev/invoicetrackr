import { getBankingInformation, getClients, getUser } from '@/api';
import { auth } from '@/auth';
import InvoiceForm from '@/components/invoice/invoice-form';

const AddNewInvoicePage = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  const numericUserId = Number(session.user.id);

  const { data: user } = await getUser(numericUserId);
  const [clientsResp, bankingInformationResp] = await Promise.all([
    getClients(numericUserId),
    getBankingInformation(numericUserId)
  ]);

  return (
    <section className="w-full">
      <InvoiceForm
        user={user}
        bankingInformation={bankingInformationResp.data}
        currency={session.user.currency}
        clients={clientsResp.data.clients}
      />
    </section>
  );
};

export default AddNewInvoicePage;
