import { Invoice } from '@invoicetrackr/types';
import { Client } from '@invoicetrackr/types';

export type GetInvoiceResp = {
  invoice: Invoice;
};

export type GetInvoicesResp = {
  invoices: Array<Invoice>;
};

export type GetInvoicesTotalAmountResp = {
  invoices: Array<Pick<Invoice, 'totalAmount' | 'status'>> | undefined;
  totalClients: number | undefined;
};

export type GetInvoicesRevenueResp = {
  revenueByMonth: Record<number, number> | undefined;
};

export type GetLatestInvoicesResp = {
  invoices:
    | Array<
        Pick<Invoice, 'id' | 'totalAmount' | 'invoiceId'> &
          Pick<Client, 'name' | 'email'>
      >
    | undefined;
};

export type AddInvoiceResp = {
  invoice: Invoice;
  message: string;
};

export type UpdateInvoiceResp = {
  invoice: Invoice;
  message: string;
};

export type UpdateInvoiceStatusResp = {
  message: string;
};

export type DeleteInvoiceResp = { message: string };

export type SendInvoiceEmailResp = { message: string };
