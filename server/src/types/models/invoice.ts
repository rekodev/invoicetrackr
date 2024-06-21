import { Static, Type } from '@sinclair/typebox';
import { User } from './user';
import { Client } from './client';

export const InvoiceService = Type.Object({
  id: Type.Optional(Type.Number()),
  description: Type.String(),
  unit: Type.String(),
  quantity: Type.Number(),
  amount: Type.Number(),
});

export const InvoiceStatus = Type.Union(
  [Type.Literal('paid'), Type.Literal('pending'), Type.Literal('canceled')],
  { errorMessage: 'Must select a valid status' }
);

export const InvoicePartyBusinessType = Type.Union(
  [Type.Literal('business'), Type.Literal('individual')],
  { errorMessage: 'Must be either "Business" or "Individual"' }
);

export const InvoicePartyType = Type.Union([
  Type.Literal('sender'),
  Type.Literal('receiver'),
]);

export const Invoice = Type.Object({
  id: Type.Optional(Type.Number()),
  invoiceId: Type.String({
    format: 'regex',
    pattern: '^[A-Za-z]{3}(0[0-9]{2}|[1-9][0-9]{2}|[1-9]0{2})$',
    minLength: 1,
    errorMessage: 'Must match format "ABC123"',
  }),
  date: Type.String({
    format: 'date-time',
    errorMessage: 'Must select a valid date',
  }),
  sender: User,
  receiver: Type.Object(
    {
      id: Type.Number(),
      type: InvoicePartyType,
      name: Type.String({ minLength: 1, errorMessage: 'Name is required' }),
      businessType: InvoicePartyBusinessType,
      businessNumber: Type.String({
        minLength: 1,
        errorMessage: 'Business number is required',
      }),
      address: Type.String({
        minLength: 1,
        errorMessage: 'Address is required',
      }),
      email: Type.String({
        format: 'email',
        errorMessage: 'Must be a valid email address',
      }),
    },
    {
      minProperties: 1,
      errorMessage: 'Receiver is required',
    }
  ),
  totalAmount: Type.Number(),
  status: InvoiceStatus,
  services: Type.Array(InvoiceService, {
    minItems: 1,
    errorMessage: 'At least one service is required',
  }),
  dueDate: Type.String({
    format: 'date-time',
    errorMessage: 'Must select a valid date',
  }),
});

export type InvoiceModel = Static<typeof Invoice>;
export type InvoiceStatus = Static<typeof InvoiceStatus>;
export type InvoiceService = Static<typeof InvoiceService>;
export type InvoicePartyBusinessType = Static<typeof InvoicePartyBusinessType>;
export type InvoicePartyType = Static<typeof InvoicePartyType>;
