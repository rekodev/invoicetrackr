import { BankingInformationFormModel } from '../models/user';

export type GetBankAccountResp = {
  bankAccount: BankingInformationFormModel;
};

export type GetBankingInformationEntriesResp =
  Array<BankingInformationFormModel>;

export type AddBankingInformationResp = {
  bankingInformation: BankingInformationFormModel;
  message: string;
};

export type UpdateBankingInformationResp = {
  bankingInformation: BankingInformationFormModel;
  message: string;
};

export type DeleteBankingInformationResp = { message: string };
