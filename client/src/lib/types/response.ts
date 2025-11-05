import {
  BankingInformationFormModel,
  ResetPasswordTokenModel,
  UserModel
} from './models/user';
import { ClientModel } from './models/client';
import { InvoiceModel } from './models/invoice';

export type ActionResponseModel = {
  ok: boolean;
  message?: string;
  validationErrors?: Record<string, string>;
};

export type RegisterUserResponse = {
  email: string;
  message: string;
};

export type GetInvoiceResp = {
  invoice: InvoiceModel;
};

export type GetInvoicesResp = {
  invoices: Array<InvoiceModel>;
};

export type GetInvoicesTotalAmountResp = {
  invoices: Array<Pick<InvoiceModel, 'totalAmount' | 'status'>> | undefined;
  totalClients: number | undefined;
};

export type GetInvoicesRevenueResp = {
  revenueByMonth: Record<number, number> | undefined;
};

export type GetLatestInvoicesResp = {
  invoices:
    | Array<
        Pick<InvoiceModel, 'id' | 'totalAmount' | 'invoiceId'> &
          Pick<ClientModel, 'name' | 'email'>
      >
    | undefined;
};

export type AddInvoiceResp = {
  invoice: InvoiceModel;
  message: string;
};

export type UpdateInvoiceResp = {
  invoice: InvoiceModel;
  message: string;
};

export type UpdateInvoiceStatusResp = {
  message: string;
};

export type DeleteInvoiceResp = { message: string };

export type SendInvoiceEmailResp = { message: string };

export type GetClientsResp = {
  clients: Array<ClientModel>;
};

export type AddClientResp = {
  client: ClientModel;
  message: string;
};

export type UpdateClientResp = {
  message: string;
  client: ClientModel;
};

export type DeleteClientResp = { message: string };

export type UpdateUserResp = {
  message: string;
  user: UserModel;
};

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

export type UpdateUserAccountSettingsResp = { message: string };

export type DeleteUserAccountResp = { message: string };

export type ResetPasswordResp = { message: string };

export type GetUserResetPasswordTokenResp = ResetPasswordTokenModel;

export type CreateNewPasswordResp = { message: string };

// Stripe
export type CreateCustomerResp = { customerId: string; message: string };
export type CreateSubscriptionResp = {
  type: string;
  clientSecret: string;
  message: string;
};
export type GetStripeCustomerIdResp = { customerId: string };
export type CancelStripeSubscriptionResp = { message: string };

// Contact
export type PostContactMessageResp = { message: string };
