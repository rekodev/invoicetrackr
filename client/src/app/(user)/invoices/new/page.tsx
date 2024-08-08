import { auth } from '@/auth';
import InvoiceForm from '@/components/invoice/InvoiceForm';

const AddNewInvoicePage = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  return (
    <section className='w-full'>
      <InvoiceForm userId={Number(session.user.id)} />
    </section>
  );
};

export default AddNewInvoicePage;
