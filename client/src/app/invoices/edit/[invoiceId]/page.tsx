'use client';

import { Spinner } from '@nextui-org/react';
import { useParams } from 'next/navigation';

import InvoiceForm from '@/components/invoice/InvoiceForm';
import ErrorAlert from '@/components/ui/ErrorAlert';
import useGetInvoice from '@/hooks/invoice/useGetInvoice';

const EditInvoicePage = () => {
  const params = useParams<{ invoiceId: string }>();
  const { invoice, isInvoiceLoading, invoiceError } = useGetInvoice(
    Number(params!.invoiceId)
  );

  if (isInvoiceLoading)
    return (
      <div className='w-full flex items-center justify-center pt-8'>
        <Spinner className='m-auto' color='secondary' />
      </div>
    );

  if (invoiceError) return <ErrorAlert />;

  return (
    <section>
      <InvoiceForm invoiceData={invoice} />
    </section>
  );
};

export default EditInvoicePage;
