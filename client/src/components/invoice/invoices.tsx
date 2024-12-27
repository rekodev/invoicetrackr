import { getInvoices } from '@/api';
import InvoiceTable from './InvoiceTable';

type Props = {
  userId: number;
};

const Invoices = async ({ userId }: Props) => {
  const {
    data: { invoices },
  } = await getInvoices(userId);

  console.log({ invoices });

  return <InvoiceTable userId={userId} invoices={invoices} />;
};

export default Invoices;
