import { getInvoice, getUser } from "@/api";
import { auth } from "@/auth";
import InvoiceForm from "@/components/invoice/InvoiceForm";

type Params = Promise<{ invoiceId: string }>;

const EditInvoicePage = async ({ params }: { params: Params }) => {
  const { invoiceId } = await params;
  const session = await auth();

  if (!session?.user?.id) return null;

  const response = await getInvoice(Number(session.user.id), Number(invoiceId));
  const { data: user } = await getUser(Number(session.user.id));

  return (
    <section>
      <InvoiceForm
        user={user}
        currency={session.user.currency}
        invoiceData={response.data.invoice}
      />
    </section>
  );
};

export default EditInvoicePage;
