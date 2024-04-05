import { Static, Type } from '@sinclair/typebox';
import { InvoicePartyBusinessType, InvoicePartyType } from './invoice';

export const User = Type.Object({
  id: Type.Number(),
  type: InvoicePartyType,
  name: Type.String(),
  businessType: InvoicePartyBusinessType,
  businessNumber: Type.String(),
  address: Type.String(),
  email: Type.Optional(Type.String()),
});

export type UserModel = Static<typeof User>;
