'use client';

import { useParams } from 'next/navigation';

const EditInvoicePage = () => {
  const params: { invoiceId: string } = useParams();

  return <div>EditInvoicePage {params.invoiceId}</div>;
};

export default EditInvoicePage;
