import { InvoicePartyBusinessType, InvoicePartyType } from '../models';

export type UserDto = {
  id: number;
  name: string;
  type: InvoicePartyType;
  business_type: InvoicePartyBusinessType;
  business_number: string;
  address: string;
  email: string;
  updated_at: string;
  created_at: string;
  signature: string;
  selected_bank_account_id?: number;
  password?: string;
  profile_picture_url: string;
  currency: string;
  language: string;
};
