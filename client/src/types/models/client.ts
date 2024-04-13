import { InvoicePartyBusinessType } from './invoice';

export type ClientModel = {
  id: number;
  name: string;
  type: 'receiver';
  businessType: InvoicePartyBusinessType;
  businessNumber: string;
  address: string;
  email: string;
};

export type ClientFormData = Omit<ClientModel, 'id' | 'businessType'> & {
  businessType: InvoicePartyBusinessType | null;
};
