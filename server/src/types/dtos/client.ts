type InvoicePartyBusinessType = 'business' | 'individual';

type InvoicePartyType = 'sender' | 'receiver';

export type ClientDto = {
  id: number;
  name: string;
  type: InvoicePartyType;
  business_type: InvoicePartyBusinessType;
  business_number: string;
  address: string;
  email?: string;
};
