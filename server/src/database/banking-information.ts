import { and, eq } from 'drizzle-orm';

import { BankAccountModel } from '../types/models';
import { db } from './db';
import { bankingInformationTable } from './schema';

export const findBankAccountByAccountNumber = async (
  userId: number,
  accountNumber: string
) => {
  const bankAccounts = await db
    .select({ id: bankingInformationTable.id })
    .from(bankingInformationTable)
    .where(
      and(
        eq(bankingInformationTable.userId, userId),
        eq(bankingInformationTable.accountNumber, accountNumber)
      )
    );

  return bankAccounts.at(0);
};

export const getBankAccountsFromDb = async (userId: number) => {
  const bankAccounts = await db
    .select({
      id: bankingInformationTable.id,
      name: bankingInformationTable.name,
      code: bankingInformationTable.code,
      accountNumber: bankingInformationTable.accountNumber
    })
    .from(bankingInformationTable)
    .where(eq(bankingInformationTable.userId, userId));

  return bankAccounts;
};

export const getBankAccountFromDb = async (
  userId: number,
  bankAccountId: number
) => {
  const bankAccounts = await db
    .select({
      id: bankingInformationTable.id,
      name: bankingInformationTable.name,
      code: bankingInformationTable.code,
      accountNumber: bankingInformationTable.accountNumber
    })
    .from(bankingInformationTable)
    .where(
      and(
        eq(bankingInformationTable.id, bankAccountId),
        eq(bankingInformationTable.userId, userId)
      )
    );

  return bankAccounts.at(0);
};

export const insertBankAccountInDb = async (
  userId: number,
  { name, accountNumber, code }: Omit<BankAccountModel, 'id'>
) => {
  const bankAccounts = await db
    .insert(bankingInformationTable)
    .values({
      name,
      accountNumber,
      code,
      userId
    })
    .returning({
      id: bankingInformationTable.id,
      name: bankingInformationTable.name,
      code: bankingInformationTable.code,
      accountNumber: bankingInformationTable.accountNumber
    });

  return bankAccounts.at(0);
};

export const updateBankAccountInDb = async (
  userId: number,
  bankAccountId: number,
  { name, accountNumber, code }: Omit<BankAccountModel, 'id'>
) => {
  const bankAccounts = await db
    .update(bankingInformationTable)
    .set({ name, code, accountNumber })
    .where(
      and(
        eq(bankingInformationTable.id, bankAccountId),
        eq(bankingInformationTable.userId, userId)
      )
    )
    .returning({
      id: bankingInformationTable.id,
      name: bankingInformationTable.name,
      code: bankingInformationTable.code,
      accountNumber: bankingInformationTable.accountNumber
    });

  return bankAccounts.at(0);
};

export const deleteBankAccountFromDb = async (
  userId: number,
  bankAccountId: number
) => {
  const bankAccounts = await db
    .delete(bankingInformationTable)
    .where(
      and(
        eq(bankingInformationTable.id, bankAccountId),
        eq(bankingInformationTable.userId, userId)
      )
    )
    .returning({ id: bankingInformationTable.id });

  return bankAccounts.at(0);
};
