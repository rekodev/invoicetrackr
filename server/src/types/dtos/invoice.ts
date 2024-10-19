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
  sender_profile_picture_url: string;
  receiver_id: number;
  receiver_name: string;
  receiver_type: InvoicePartyType;
  receiver_business_type: InvoicePartyBusinessType;
  receiver_business_number: string;
  receiver_address: string;
  receiver_email: string;
  services: Array<InvoiceService>;
  bank_account_id: number;
  bank_account_number: string;
  bank_account_name: string;
  bank_account_code: string;
};
