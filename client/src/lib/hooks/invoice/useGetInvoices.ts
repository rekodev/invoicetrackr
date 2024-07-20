import { useMemo } from 'react';
import useSWR from 'swr';

import { InvoiceModel } from '@/lib/types/models/invoice';

import SWRKeys from '../../constants/swrKeys';

const useGetInvoices = () => {
  const { data, isLoading, mutate, error, isValidating } = useSWR<
    Array<InvoiceModel>
  >(SWRKeys.invoices(1));

  return useMemo(
    () => ({
      invoices: data,
      isInvoicesLoading: isLoading,
      mutateInvoices: mutate,
      invoicesError: error,
      invoicesIsValidating: isValidating,
    }),
    [data, isLoading, mutate, error, isValidating]
  );
};

export default useGetInvoices;
