import { InvoicePartyBusinessType, InvoicePartyType } from './invoice';

export type UserModel = {
  id: number;
  name: string;
  type: 'sender';
  businessType: InvoicePartyBusinessType;
  businessNumber: string;
  address: string;
  email: string;
};
