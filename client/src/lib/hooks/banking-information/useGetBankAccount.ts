import { useMemo } from 'react';
import useSWR from 'swr';

import { BankingInformation } from '@/lib/types/models/user';

import SWRKeys from '../../constants/swrKeys';

type Props = {
  userId: number;
  bankAccountId: number | undefined;
};

const useGetBankAccount = ({ userId, bankAccountId }: Props) => {
  const { data, isLoading, mutate, error, isValidating } =
    useSWR<BankingInformation>(
      bankAccountId ? SWRKeys.bankAccount(userId, bankAccountId) : null
    );

  return useMemo(
    () => ({
      bankAccount: data,
      isBankAccountLoading: isLoading,
      mutateBankAccount: mutate,
      bankAccountError: error,
      bankAccountIsValidating: isValidating,
    }),
    [data, isLoading, mutate, error, isValidating]
  );
};

export default useGetBankAccount;
