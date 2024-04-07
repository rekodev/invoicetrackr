import { ClientModel } from './client';
import { UserModel } from './user';

export type InvoicePartyBusinessType = 'business' | 'individual';

export type InvoicePartyType = 'sender' | 'receiver';

export type InvoiceStatus = 'paid' | 'pending' | 'canceled';

export type InvoiceService = {
  description: string;
  unit: string;
  quantity: number;
  amount: number;
};

export type InvoiceModel = {
  id: number;
  invoiceId: string;
  date: string;
  company: string;
  sender: UserModel;
  receiver: ClientModel;
  totalAmount: number;
  status: InvoiceStatus;
  services: Array<InvoiceService>;
  dueDate: string;
};
