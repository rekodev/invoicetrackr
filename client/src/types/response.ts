import { ClientModel } from './models/client';
import { InvoiceModel } from './models/invoice';

export type Message = { message: string };

export type GetInvoicesResp = Message & {
  invoices: Array<InvoiceModel>;
};

export type AddInvoiceResp = Message & {
  invoice: InvoiceModel;
};

export type AddClientResp = Message & {
  client: ClientModel;
};

export type UpdateClientResp = Message & {
  client: ClientModel;
};

export type DeleteClientResp = Message;
