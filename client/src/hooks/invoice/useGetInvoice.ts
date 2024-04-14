import { useMemo } from 'react';
import useSWR from 'swr';

import { InvoiceModel } from '@/types/models/invoice';

import SWRKeys from '../../constants/swrKeys';

const useGetInvoice = (invoiceId: number) => {
  const { data, isLoading, mutate, error, isValidating } = useSWR<InvoiceModel>(
    SWRKeys.invoice(1, invoiceId)
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
