import { ApiError } from '@/api/apiInstance';

import { ClientModel } from './models/client';
import { InvoiceModel } from './models/invoice';

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
