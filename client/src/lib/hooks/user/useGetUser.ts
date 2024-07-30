import { useMemo } from 'react';
import useSWR from 'swr';

import { UserModel } from '@/lib/types/models/user';

import SWRKeys from '../../constants/swrKeys';

type Props = {
  userId: number;
};

const useGetUser = ({ userId }: Props) => {
  const { data, isLoading, mutate, error, isValidating } = useSWR<UserModel>(
    SWRKeys.user(userId)
  );

  return useMemo(
    () => ({
      user: data,
      isUserLoading: isLoading,
      mutateUser: mutate,
      userError: error,
      userIsValidating: isValidating,
    }),
    [data, isLoading, mutate, error, isValidating]
  );
};

export default useGetUser;
