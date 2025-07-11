import { useMemo } from 'react';
import useSWR from 'swr';

import { BankingInformationFormModel } from '@/lib/types/models/user';

import SWRKeys from '../../constants/swr-keys';

type Props = {
  userId: number;
};

const useGetBankAccounts = ({ userId }: Props) => {
  const { data, isLoading, mutate, error, isValidating } = useSWR<
    Array<BankingInformationFormModel>
  >(SWRKeys.bankAccounts(userId));

  return useMemo(
    () => ({
      bankAccounts: data,
      isBankAccountsLoading: isLoading,
      mutateBankAccounts: mutate,
      bankAccountsError: error,
      bankAccountsIsValidating: isValidating
    }),
    [data, isLoading, mutate, error, isValidating]
  );
};

export default useGetBankAccounts;
