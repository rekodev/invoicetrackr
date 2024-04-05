import { InvoicePartyBusinessType, InvoicePartyType } from '../models/invoice';

export type UserDto = {
  id: number;
  name: string;
  type: InvoicePartyType;
  business_type: InvoicePartyBusinessType;
  business_number: string;
  address: string;
  email?: string;
  updated_at: string;
  created_at: string;
};
