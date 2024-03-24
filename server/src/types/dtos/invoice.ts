type InvoiceParty = {
  first_name: string;
  last_name: string;
  type: string;
  business_number: string;
  address: string;
  email?: string;
};

type InvoiceService = {
  description: string;
  unit: string;
  quantity: number;
  amount: number;
};

type InvoiceStatus = 'paid' | 'pending' | 'canceled';

export type InvoiceDto = {
  id: string;
  date: string;
  company: string;
  sender: InvoiceParty;
  receiver: InvoiceParty;
  total_amount: number;
  status: InvoiceStatus;
  services: Array<InvoiceService>;
  due_date: string;
};
