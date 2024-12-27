import { useMemo } from 'react';
import useSWR from 'swr';

import { ClientModel } from '@/lib/types/models/client';

import SWRKeys from '../../constants/swrKeys';

type Props = {
  userId: number;
};

const useGetClients = ({ userId }: Props) => {
  const { data, isLoading, mutate, error, isValidating } = useSWR<{
    clients: Array<ClientModel>;
  }>(SWRKeys.clients(userId));

  return useMemo(
    () => ({
      clients: data?.clients,
      isClientsLoading: isLoading,
      mutateClients: mutate,
      clientsError: error,
      clientsIsValidating: isValidating,
    }),
    [data, isLoading, mutate, error, isValidating]
  );
};

export default useGetClients;
