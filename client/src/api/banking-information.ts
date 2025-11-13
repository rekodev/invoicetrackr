import {
  AddBankingInformationResponse,
  BankAccountBody,
  DeleteBankingInformationResponse,
  GetBankAccountResponse,
  GetBankingInformationEntriesResponse,
  UpdateBankingInformationResponse
} from '@invoicetrackr/types';
import { BankAccount } from '@invoicetrackr/types';

import api from './api-instance';

export const getBankAccount = async (userId: number, bankAccountId: number) =>
  await api.get<GetBankAccountResponse>(
    `/api/${userId}/banking-information/${bankAccountId}`
  );

export const getBankingInformationEntries = async (userId: number) =>
  await api.get<GetBankingInformationEntriesResponse>(
    `/api/${userId}/banking-information`
  );

export const addBankingInformation = async (
  userId: number,
  bankingInformation: BankAccountBody,
  hasSelectedBankAccount: boolean
) =>
  await api.post<AddBankingInformationResponse>(
    `/api/${userId}/banking-information`,
    {
      ...bankingInformation,
      hasSelectedBankAccount
    }
  );

export const updateBankingInformation = async (
  userId: number,
  bankingInformation: BankAccount
) =>
  await api.put<UpdateBankingInformationResponse>(
    `/api/${userId}/banking-information/${bankingInformation.id}`,
    {
      ...bankingInformation
    }
  );

export const deleteBankingInformation = async (
  userId: number,
  bankAccountId: number
) =>
  await api.delete<DeleteBankingInformationResponse>(
    `/api/${userId}/banking-information/${bankAccountId}`
  );
