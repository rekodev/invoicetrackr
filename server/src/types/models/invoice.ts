import { Static, Type, ValueGuard } from '@sinclair/typebox';
import { User } from './user';
import { Client } from './client';

export const InvoiceService = Type.Object({
  id: Type.Optional(Type.Number()),
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
  id: Type.Optional(Type.Number()),
  invoiceId: Type.String(),
  date: Type.String(),
  sender: User,
  receiver: Client,
  totalAmount: Type.Number(),
  status: InvoiceStatus,
  services: Type.Array(InvoiceService),
  dueDate: Type.String(),
});

export const InvoicePartyBusinessType = Type.Union(
  [Type.Literal('business'), Type.Literal('individual')],
  { errorMessage: 'Must be either "Business" or "Individual"' }
);

export const InvoicePartyType = Type.Union([
  Type.Literal('sender'),
  Type.Literal('receiver'),
]);

export type InvoiceModel = Static<typeof Invoice>;
export type InvoiceStatus = Static<typeof InvoiceStatus>;
export type InvoiceService = Static<typeof InvoiceService>;
export type InvoicePartyBusinessType = Static<typeof InvoicePartyBusinessType>;
export type InvoicePartyType = Static<typeof InvoicePartyType>;
