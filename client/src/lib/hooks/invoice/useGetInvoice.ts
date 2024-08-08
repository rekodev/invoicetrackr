import { useMemo } from 'react';
import useSWR from 'swr';

import { InvoiceModel } from '@/lib/types/models/invoice';

import SWRKeys from '../../constants/swrKeys';

type Props = {
  userId: number;
  invoiceId?: number;
};

const useGetInvoice = ({ userId, invoiceId }: Props) => {
  const { data, isLoading, mutate, error, isValidating } = useSWR<InvoiceModel>(
    invoiceId ? SWRKeys.invoice(userId, invoiceId) : null
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
