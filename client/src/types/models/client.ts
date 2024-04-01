import { InvoicePartyBusinessType, InvoicePartyType } from './invoice';

export type ClientModel = {
  id: number;
  firstName: string;
  lastName: string;
  type: InvoicePartyType;
  businessType: InvoicePartyBusinessType;
  businessNumber: string;
  address: string;
  email?: string;
};
