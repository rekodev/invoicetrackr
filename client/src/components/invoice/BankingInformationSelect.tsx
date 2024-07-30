'use client';

import { BuildingLibraryIcon } from '@heroicons/react/24/outline';
import { Select, Selection, SelectItem } from '@nextui-org/react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import useGetBankAccounts from '@/lib/hooks/banking-information/useGetBankAccounts';
import useGetUser from '@/lib/hooks/user/useGetUser';
import { BankingInformation } from '@/lib/types/models/user';

type Props = {
  userId: number;
  setSelectedBankAccount: Dispatch<
    SetStateAction<BankingInformation | undefined>
  >;
  existingBankAccountId?: number;
};

export default function BankingInformationSelect({
  userId,
  setSelectedBankAccount,
  existingBankAccountId,
}: Props) {
  const { user } = useGetUser({ userId });
  const { bankAccounts, isBankAccountsLoading } = useGetBankAccounts({
    userId,
  });
  const [value, setValue] = useState(
    existingBankAccountId
      ? new Set([existingBankAccountId.toString()])
      : new Set([])
  );

  useEffect(() => {
    if (existingBankAccountId || !user) return;

    setValue(new Set([user.selectedBankAccountId.toString()]));
  }, [existingBankAccountId, user]);

  useEffect(() => {
    const newBankAccount = bankAccounts?.find(
      (account) => account.id === Number(value.values().next().value)
    );

    setSelectedBankAccount(newBankAccount);
  }, [bankAccounts, value, setSelectedBankAccount]);

  return (
    <Select
      selectedKeys={value}
      onSelectionChange={setValue as (selection: Selection) => void}
      selectionMode='single'
      aria-label='Bank Account'
      isLoading={isBankAccountsLoading}
      items={bankAccounts || []}
      className='max-w-xs'
      placeholder='Select Bank Account'
      variant='flat'
      classNames={{
        label: 'group-data-[filled=true]:-translate-y-5',
        trigger: 'min-h-16',
        listboxWrapper: 'max-h-[400px]',
      }}
      listboxProps={{
        itemClasses: {
          base: [
            'rounded-md',
            'text-default-500',
            'transition-opacity',
            'data-[hover=true]:text-foreground',
            'data-[hover=true]:bg-default-100',
            'dark:data-[hover=true]:bg-default-50',
            'data-[selectable=true]:focus:bg-default-50',
            'data-[pressed=true]:opacity-70',
            'data-[focus-visible=true]:ring-default-500',
          ],
        },
      }}
      popoverProps={{
        classNames: {
          base: 'before:bg-default-200',
          content: 'p-0 border-small border-divider bg-background',
        },
      }}
      renderValue={(items) => {
        return items.map((item) => (
          <div key={item.key} className='flex items-center gap-2'>
            <BuildingLibraryIcon className='w-5 h-5' />
            <div className='flex flex-col'>
              <span>{item.data?.name}</span>
              <span className='text-default-500 text-tiny'>
                {item.data?.accountNumber}
              </span>
            </div>
          </div>
        ));
      }}
    >
      {(bankAccount) => (
        <SelectItem key={bankAccount.id!} textValue={bankAccount.name}>
          <div className='flex gap-2 items-center'>
            <BuildingLibraryIcon className='w-5 h-5' />
            <div className='flex flex-col'>
              <span className='text-small'>{bankAccount.name}</span>
              <span className='text-tiny text-default-400'>
                {bankAccount.accountNumber}
              </span>
            </div>
          </div>
        </SelectItem>
      )}
    </Select>
  );
}
