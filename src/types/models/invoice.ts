export type InvoiceModel = {
  id: number;
  name: string;
  date: string;
  company: string;
  price: number;
  status: InvoiceStatus;
};

export type InvoiceStatus = 'paid' | 'pending' | 'canceled';
