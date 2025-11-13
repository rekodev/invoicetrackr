export type {
  Client,
  ClientGet,
  InvoicePartyBusinessType
} from '@invoicetrackr/types';

import type { Client, InvoicePartyBusinessType } from '@invoicetrackr/types';
export type ClientModel = Client;

export type ClientFormData = Omit<Client, 'id' | 'businessType'> & {
  businessType: InvoicePartyBusinessType | null;
};
