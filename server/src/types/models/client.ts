import { Static, Type } from '@sinclair/typebox';
import { InvoicePartyBusinessType, InvoicePartyType } from './invoice';

export const Client = Type.Object({
  id: Type.Number(),
  type: InvoicePartyType,
  name: Type.String({ minLength: 1 }),
  businessType: InvoicePartyBusinessType,
  businessNumber: Type.String({ minLength: 1 }),
  address: Type.String({ minLength: 1 }),
  email: Type.String({ format: 'email' }),
});

export type ClientModel = Static<typeof Client>;
