import type { InvoiceWorkspaceResponse } from '@invoicetrackr/types';
import { useState } from 'react';

import { getInvoiceWorkspaceAction } from '@/lib/actions/invoice';

export const useInvoiceWorkspaceLoader = ({
  userId,
  invoiceId,
  fallbackError
}: {
  userId: number;
  invoiceId: number;
  fallbackError: string;
}) => {
  const [data, setData] = useState<InvoiceWorkspaceResponse | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const result = await getInvoiceWorkspaceAction(userId, invoiceId);
      if (!result.ok) {
        setError(result.message);
        return null;
      }
      setData(result.data);
      return result.data;
    } catch {
      setError(fallbackError);
      return null;
    }
  };

  return { data, setData, error, setError, load };
};
