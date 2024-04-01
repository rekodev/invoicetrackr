export type InvoicePartyBusinessType = 'business' | 'individual';

export type InvoicePartyType = 'sender' | 'receiver';

export type InvoiceParty = {
  firstName: string;
  lastName: string;
  businessType: string;
  businessNumber: string;
  address: string;
  email?: string;
  type: InvoicePartyType;
};

export type InvoiceStatus = 'paid' | 'pending' | 'canceled';

export type InvoiceService = {
  description: string;
  unit: string;
  quantity: number;
  amount: number;
};

export type InvoiceModel = {
  id: string;
  date: string;
  company: string;
  sender: InvoiceParty;
  receiver: InvoiceParty;
  totalAmount: number;
  status: InvoiceStatus;
  services: Array<InvoiceService>;
  dueDate: string;
};
