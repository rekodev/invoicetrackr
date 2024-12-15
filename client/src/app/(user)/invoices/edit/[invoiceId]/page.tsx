import { getInvoice } from '@/api';
import { auth } from '@/auth';
import InvoiceForm from '@/components/invoice/InvoiceForm';

const EditInvoicePage = async ({
  params,
}: {
  params: { invoiceId: string };
}) => {
  const { invoiceId } = await params;
  const session = await auth();

  if (!session?.user?.id) return null;

  const response = await getInvoice(Number(session.user.id), Number(invoiceId));

  return (
    <section>
      <InvoiceForm
        userId={Number(session.user.id)}
        invoiceData={response.data.invoice}
      />
    </section>
  );
};

export default EditInvoicePage;
