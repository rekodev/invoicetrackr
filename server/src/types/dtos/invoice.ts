import { InvoiceService, InvoiceStatus } from '../models/invoice';
import { ClientDto } from './client';
import { UserDto } from './user';

export type InvoiceDto = {
  id: number;
  invoice_id: string;
  date: string;
  company: string;
  sender: ClientDto;
  receiver: UserDto;
  total_amount: number;
  status: InvoiceStatus;
  services: Array<InvoiceService>;
  due_date: string;
};
