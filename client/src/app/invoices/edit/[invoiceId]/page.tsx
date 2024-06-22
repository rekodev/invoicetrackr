'use client';

import { useParams } from 'next/navigation';

import InvoiceForm from '@/components/invoice/InvoiceForm';
import ErrorAlert from '@/components/ui/ErrorAlert';
import Loader from '@/components/ui/Loader';
import useGetInvoice from '@/hooks/invoice/useGetInvoice';

const EditInvoicePage = () => {
  const params = useParams<{ invoiceId: string }>();
  const { invoice, isInvoiceLoading, invoiceError } = useGetInvoice(
    Number(params!.invoiceId)
  );

  if (isInvoiceLoading) return <Loader />;

  if (invoiceError) return <ErrorAlert />;

  return (
    <section>
      <InvoiceForm invoiceData={invoice} />
    </section>
  );
};

export default EditInvoicePage;
