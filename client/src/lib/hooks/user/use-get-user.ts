import { useMemo } from 'react';
import useSWR from 'swr';

import { UserModel } from '@/lib/types/models/user';

import SWRKeys from '../../constants/swr-keys';

type Props = {
  userId: number | undefined;
};

const useGetUser = ({ userId }: Props) => {
  const { data, isLoading, mutate, error, isValidating } = useSWR<UserModel>(
    userId ? SWRKeys.user(userId) : null
  );

  return useMemo(
    () => ({
      user: data,
      isUserLoading: isLoading,
      mutateUser: mutate,
      userError: error,
      userIsValidating: isValidating
    }),
    [data, isLoading, mutate, error, isValidating]
  );
};

export default useGetUser;
