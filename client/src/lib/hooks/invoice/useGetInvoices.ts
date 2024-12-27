import { useMemo } from 'react';
import useSWR from 'swr';

import { InvoiceModel } from '@/lib/types/models/invoice';

import SWRKeys from '../../constants/swrKeys';

type Props = {
  userId: number;
};

const useGetInvoices = ({ userId }: Props) => {
  const { data, isLoading, mutate, error, isValidating } = useSWR<{
    invoices: Array<InvoiceModel>;
  }>(SWRKeys.invoices(userId));

  return useMemo(
    () => ({
      invoices: data?.invoices,
      isInvoicesLoading: isLoading,
      mutateInvoices: mutate,
      invoicesError: error,
      invoicesIsValidating: isValidating,
    }),
    [data, isLoading, mutate, error, isValidating]
  );
};

export default useGetInvoices;
