import { BankAccount } from '@invoicetrackr/types';

export type GetBankAccountResp = {
  bankAccount: BankAccount;
};

export type GetBankingInformationEntriesResp = {
  bankAccounts: Array<BankAccount>;
};

export type AddBankingInformationResp = {
  bankingInformation: BankAccount;
  message: string;
};

export type UpdateBankingInformationResp = {
  bankingInformation: BankAccount;
  message: string;
};

export type DeleteBankingInformationResp = { message: string };
