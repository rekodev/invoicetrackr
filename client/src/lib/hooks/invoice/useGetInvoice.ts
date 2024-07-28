import { useMemo } from 'react';
import useSWR from 'swr';

import { InvoiceModel } from '@/lib/types/models/invoice';

import SWRKeys from '../../constants/swrKeys';

const useGetInvoice = (invoiceId?: number) => {
  const { data, isLoading, mutate, error, isValidating } = useSWR<InvoiceModel>(
    invoiceId ? SWRKeys.invoice(1, invoiceId) : null
  );

  return useMemo(
    () => ({
      invoice: data,
      isInvoiceLoading: isLoading,
      mutateInvoice: mutate,
      invoiceError: error,
      invoiceIsValidating: isValidating,
    }),
    [data, isLoading, mutate, error, isValidating]
  );
};

export default useGetInvoice;
