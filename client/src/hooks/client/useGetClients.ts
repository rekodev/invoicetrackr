import { useMemo } from 'react';
import useSWR from 'swr';

import { ClientModel } from '@/types/models/client';

import SWRKeys from '../../constants/swrKeys';

const useGetClients = () => {
  const { data, isLoading, mutate, error, isValidating } = useSWR<
    Array<ClientModel>
  >(SWRKeys.clients(1));

  return useMemo(
    () => ({
      clients: data,
      isClientsLoading: isLoading,
      mutateClients: mutate,
      clientsError: error,
      clientsIsValidating: isValidating,
    }),
    [data, isLoading, mutate, error, isValidating]
  );
};

export default useGetClients;
