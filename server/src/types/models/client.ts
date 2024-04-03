import { Static, Type } from '@sinclair/typebox';
import { InvoicePartyBusinessType, InvoicePartyType } from './invoice';

export const Client = Type.Object({
  id: Type.Number(),
  type: InvoicePartyType,
  name: Type.String(),
  businessType: InvoicePartyBusinessType,
  businessNumber: Type.String(),
  address: Type.String(),
  email: Type.Optional(Type.String()),
});

export type ClientModel = Static<typeof Client>;
