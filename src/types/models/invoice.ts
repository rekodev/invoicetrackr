export type InvoiceModel = {
  id: number;
  name: string;
  date: string;
  company: string;
  status: InvoiceStatus;
};

export type InvoiceStatus = 'paid' | 'pending' | 'canceled';
