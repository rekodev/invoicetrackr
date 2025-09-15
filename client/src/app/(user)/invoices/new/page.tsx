import { getClients, getUser } from '@/api';
import { auth } from '@/auth';
import InvoiceForm from '@/components/invoice/invoice-form';

const AddNewInvoicePage = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  const numericUserId = Number(session.user.id);

  const { data: user } = await getUser(numericUserId);
  const {
    data: { clients }
  } = await getClients(numericUserId);

  return (
    <section className="w-full">
      <InvoiceForm
        user={user}
        currency={session.user.currency}
        clients={clients}
      />
    </section>
  );
};

export default AddNewInvoicePage;
