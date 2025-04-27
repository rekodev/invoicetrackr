import { ApiError } from '@/api/apiInstance';

import { ClientModel } from './models/client';
import { InvoiceModel } from './models/invoice';
import {
  BankingInformationFormModel,
  ResetPasswordTokenModel,
  UserModel
} from './models/user';

export type ActionResponseModel = {
  ok: boolean;
  message?: string;
  validationErrors?: Record<string, string>;
};

export type RegisterUserResponse = ApiError & {
  email: string;
};

export type GetInvoiceResp = ApiError & {
  invoice: InvoiceModel;
};

export type GetInvoicesResp = ApiError & {
  invoices: Array<InvoiceModel>;
};

export type GetInvoicesTotalAmountResp = ApiError & {
  invoices: Array<Pick<InvoiceModel, 'totalAmount' | 'status'>> | undefined;
  totalClients: number | undefined;
};

export type GetInvoicesRevenueResp = ApiError & {
  revenueByMonth: Record<number, number> | undefined;
};

export type GetLatestInvoicesResp = ApiError & {
  invoices:
    | Array<
        Pick<InvoiceModel, 'id' | 'totalAmount'> &
          Pick<ClientModel, 'name' | 'email'>
      >
    | undefined;
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
  bankAccount: BankingInformationFormModel;
};

export type GetBankingInformationResp = ApiError &
  Array<BankingInformationFormModel>;

export type AddBankingInformationResp = ApiError & {
  bankingInformation: BankingInformationFormModel;
};

export type UpdateUserAccountSettingsResp = ApiError;

export type DeleteUserAccountResp = ApiError;

export type ResetPasswordResp = ApiError & { message: string };

export type GetUserResetPasswordTokenResp = ApiError & ResetPasswordTokenModel;

// Stripe
export type CreatePaymentIntentResp = ApiError & { clientSecret: string };
