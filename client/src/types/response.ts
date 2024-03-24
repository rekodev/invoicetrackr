import { InvoiceModel } from './models/invoice';

export type AxiosErrorMessage = { message: string };

export type GetInvoicesResp = AxiosErrorMessage & {
  invoices: Array<InvoiceModel>;
  message: string;
};
