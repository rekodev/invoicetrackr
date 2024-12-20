import { ApiError } from '@/api/apiInstance';

import { ClientModel } from './models/client';
import { InvoiceModel } from './models/invoice';
import { BankingInformation, UserModel } from './models/user';

export type RegisterUserResponse = ApiError & {
  email: string;
};

export type GetInvoiceResp = ApiError & {
  invoice: InvoiceModel;
};

export type GetInvoicesResp = ApiError & {
  invoices: Array<InvoiceModel>;
};

export type AddInvoiceResp = ApiError & {
  invoice: InvoiceModel;
};

export type UpdateInvoiceResp = ApiError & {
  invoice: InvoiceModel;
};

export type DeleteInvoiceResp = ApiError;

export type AddClientResp = ApiError & {
  client: ClientModel;
};

export type UpdateClientResp = ApiError & {
  client: ClientModel;
};

export type DeleteClientResp = ApiError;

export type UpdateUserResp = ApiError & {
  user: UserModel;
};

export type GetBankAccountResp = ApiError & {
  bankAccount: BankingInformation;
};

export type GetBankingInformationResp = ApiError & Array<BankingInformation>;

export type AddBankingInformationResp = ApiError & {
  bankingInformation: BankingInformation;
};

export type UpdateUserAccountSettingsResp = ApiError;

export type DeleteUserAccountResp = ApiError;
