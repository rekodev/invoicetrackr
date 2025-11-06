import { InvoiceModel } from '../models/invoice';
import { ClientModel } from '../models/client';

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
