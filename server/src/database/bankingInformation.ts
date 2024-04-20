import { BankAccountDto } from '../types/dtos';
import { BankAccountModel } from '../types/models';
import { sql } from './db';

export const findBankAccountByAccountNumber = async (
  userId: number,
  accountNumber: string
) => {
  const [bankAccount] = await sql`
        select
            id
        from banking_information
        where user_id = ${userId} and account_number = ${accountNumber};    
    `;

  return bankAccount;
};

export const getBankAccountsFromDb = async (userId: number) => {
  const bankAccounts = await sql<Array<BankAccountDto>>`
        select 
            id
            name
            code
            account_number
        from
            banking_information
        where user_id = ${userId}
    `;

  return bankAccounts;
};

export const getBankAccountFromDb = async (
  userId: number,
  bankAccountId: number
) => {
  const [bankAccount] = await sql<Array<BankAccountDto>>`
    select 
        id
        name
        code
        account_number
    from
        banking_information
    where user_id = ${userId} and id = ${bankAccountId}
`;

  return bankAccount;
};

export const insertBankAccountInDb = async (
  userId: number,
  { name, accountNumber, code }: Omit<BankAccountModel, 'id'>
) => {
  const [bankAccount] = await sql<Array<BankAccountDto>>`
        insert into banking_information
            (name, code, account_number, user_id)
        values
            (${name}, ${code}, ${accountNumber}, ${userId})
        returning id, name, code, account_number
    `;

  return bankAccount;
};

export const updateBankAccountInDb = async (
  userId: number,
  bankAccountId: number,
  { name, accountNumber, code }: Omit<BankAccountModel, 'id'>
) => {
  const [bankAccount] = await sql<Array<BankAccountDto>>`
    update banking_information
        set
            name = ${name},
            code = ${code},
            account_number = ${accountNumber}
        where id = ${bankAccountId} and user_id = ${userId}
        returning id, name, code, account_number
    `;

  return bankAccount;
};

export const deleteBankAccountFromDb = async (
  userId: number,
  bankAccountId: number
) => {
  const [bankAccount] = await sql`
    delete from banking_information
    where id = ${bankAccountId} and user_id = ${userId}
    returning id
  `;

  return bankAccount;
};
