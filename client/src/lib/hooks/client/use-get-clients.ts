import { useMemo } from 'react';
import useSWR from 'swr';

import { ClientModel } from '@/lib/types/models/client';

import SWRKeys from '../../constants/swr-keys';

type Props = {
  userId: number;
};

const useGetClients = ({ userId }: Props) => {
  const { data, isLoading, mutate, error, isValidating } = useSWR<
    Array<ClientModel>
  >(SWRKeys.clients(userId));

  return useMemo(
    () => ({
      clients: data,
      isClientsLoading: isLoading,
      mutateClients: mutate,
      clientsError: error,
      clientsIsValidating: isValidating
    }),
    [data, isLoading, mutate, error, isValidating]
  );
};

export default useGetClients;
