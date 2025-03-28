import { getUser } from "@/api";
import { auth } from "@/auth";
import InvoiceForm from "@/components/invoice/InvoiceForm";

const AddNewInvoicePage = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  const { data: user } = await getUser(Number(session.user.id));

  return (
    <section className="w-full">
      <InvoiceForm user={user} currency={session.user.currency} />
    </section>
  );
};

export default AddNewInvoicePage;
