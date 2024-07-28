import { useMemo } from 'react';
import useSWR from 'swr';

import { BankingInformation } from '@/lib/types/models/user';

import SWRKeys from '../../constants/swrKeys';

const useGetBankAccounts = () => {
  const { data, isLoading, mutate, error, isValidating } = useSWR<
    Array<BankingInformation>
  >(SWRKeys.bankAccounts(1));

  return useMemo(
    () => ({
      bankAccounts: data,
      isBankAccountsLoading: isLoading,
      mutateBankAccounts: mutate,
      bankAccountsError: error,
      bankAccountsIsValidating: isValidating,
    }),
    [data, isLoading, mutate, error, isValidating]
  );
};

export default useGetBankAccounts;
