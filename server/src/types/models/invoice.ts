import { Static, Type } from '@sinclair/typebox';

export const InvoiceParty = Type.Object({
  name: Type.String(),
  type: Type.String(),
  businessNumber: Type.String(),
  address: Type.String(),
  email: Type.Optional(Type.String()),
});

export const InvoiceService = Type.Object({
  description: Type.String(),
  unit: Type.String(),
  quantity: Type.Number(),
  amount: Type.Number(),
});

export const InvoiceStatus = Type.Union([
  Type.Literal('paid'),
  Type.Literal('pending'),
  Type.Literal('canceled'),
]);

export const Invoice = Type.Object({
  id: Type.Number(),
  invoiceId: Type.String(),
  date: Type.String(),
  company: Type.String(),
  sender: InvoiceParty,
  receiver: InvoiceParty,
  totalAmount: Type.Number(),
  status: InvoiceStatus,
  services: Type.Array(InvoiceService),
  dueDate: Type.String(),
});

export const InvoicePartyBusinessType = Type.Union([
  Type.Literal('business'),
  Type.Literal('individual'),
]);

export const InvoicePartyType = Type.Union([
  Type.Literal('sender'),
  Type.Literal('receiver'),
]);

export type InvoiceModel = Static<typeof Invoice>;
export type InvoiceStatus = Static<typeof InvoiceStatus>;
export type InvoiceService = Static<typeof InvoiceService>;
export type InvoiceParty = Static<typeof InvoiceParty>;
export type InvoicePartyBusinessType = Static<typeof InvoicePartyBusinessType>;
export type InvoicePartyType = Static<typeof InvoicePartyType>;
