import {
  AddBankingInformationResp,
  DeleteBankingInformationResp,
  GetBankAccountResp,
  GetBankingInformationEntriesResp,
  UpdateBankingInformationResp
} from '@/lib/types/response';
import { BankingInformationFormModel } from '@/lib/types/models/user';

import api from './api-instance';

export const getBankAccount = async (userId: number, bankAccountId: number) =>
  await api.get<GetBankAccountResp>(
    `/api/${userId}/banking-information/${bankAccountId}`
  );

export const getBankingInformationEntries = async (userId: number) =>
  await api.get<GetBankingInformationEntriesResp>(
    `/api/${userId}/banking-information`
  );

export const addBankingInformation = async (
  userId: number,
  bankingInformation: BankingInformationFormModel,
  hasSelectedBankAccount: boolean
) =>
  await api.post<AddBankingInformationResp>(
    `/api/${userId}/banking-information`,
    {
      ...bankingInformation,
      hasSelectedBankAccount
    }
  );

export const updateBankingInformation = async (
  userId: number,
  bankingInformation: BankingInformationFormModel
) =>
  await api.put<UpdateBankingInformationResp>(
    `/api/${userId}/banking-information/${bankingInformation.id}`,
    {
      ...bankingInformation
    }
  );

export const deleteBankingInformation = async (
  userId: number,
  bankAccountId: number
) =>
  await api.delete<DeleteBankingInformationResp>(
    `/api/${userId}/banking-information/${bankAccountId}`
  );
