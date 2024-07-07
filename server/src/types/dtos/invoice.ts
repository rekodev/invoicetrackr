import {
  InvoicePartyBusinessType,
  InvoicePartyType,
  InvoiceService,
  InvoiceStatus,
} from '../models';

export type InvoiceDto = {
  id: number;
  invoice_id: string;
  date: string;
  total_amount: number;
  status: InvoiceStatus;
  due_date: string;
  sender_id: number;
  sender_name: string;
  sender_type: InvoicePartyType;
  sender_business_type: InvoicePartyBusinessType;
  sender_business_number: string;
  sender_address: string;
  sender_email: string;
  sender_signature: string;
  receiver_id: number;
  receiver_name: string;
  receiver_type: InvoicePartyType;
  receiver_business_type: InvoicePartyBusinessType;
  receiver_business_number: string;
  receiver_address: string;
  receiver_email: string;
  services: Array<InvoiceService>;
};
