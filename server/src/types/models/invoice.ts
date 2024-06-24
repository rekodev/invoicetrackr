import { Static, Type } from '@sinclair/typebox';
import { User } from './user';

export const InvoiceService = Type.Object({
  id: Type.Optional(Type.Number()),
  description: Type.String({
    minLength: 1,
    maxLength: 200,
    errorMessage: 'Description up to 200 characters is required',
  }),
  unit: Type.String({
    minLength: 1,
    maxLength: 20,
    errorMessage: 'Unit up to 10 characters is required',
  }),
  quantity: Type.Number({
    minimum: 0.0001,
    maximum: 10000,
    errorMessage: 'Quantity between 0.0001 and 10,000 is required',
  }),
  amount: Type.Number({
    minimum: 0.01,
    maximum: 1000000,
    errorMessage: 'Amount between 0.01 and 1,000,000 is required',
  }),
});

export const InvoiceStatus = Type.Union(
  [Type.Literal('paid'), Type.Literal('pending'), Type.Literal('canceled')],
  { errorMessage: 'Valid status is required' }
);

export const InvoicePartyBusinessType = Type.Union(
  [Type.Literal('business'), Type.Literal('individual')],
  { errorMessage: '"Business" or "Individual" required' }
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
    errorMessage: 'Required to match format "ABC123"',
  }),
  date: Type.String({
    format: 'date',
    errorMessage: 'Valid date is required',
  }),
  sender: User,
  senderSignature: Type.Union(
    [
      Type.String({ minLength: 1 }),
      Type.Object({ size: Type.Number(), type: Type.String() }),
    ],
    { errorMessage: 'Signature is required' }
  ),
  receiver: Type.Object(
    {
      id: Type.Number(),
      type: InvoicePartyType,
      name: Type.String({ minLength: 1, errorMessage: 'Name is required' }),
      businessType: InvoicePartyBusinessType,
      businessNumber: Type.String({
        minLength: 1,
        errorMessage: 'Business number up to 15 characters is required',
      }),
      address: Type.String({
        minLength: 1,
        errorMessage: 'Address up to 255 characters is required',
      }),
      email: Type.String({
        format: 'email',
        errorMessage: 'Valid email is required',
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
    maxItems: 100,
    errorMessage: 'At least one service is required',
  }),
  dueDate: Type.String({
    format: 'date',
    errorMessage: 'Valid date is required',
  }),
});

export type InvoiceModel = Static<typeof Invoice>;
export type InvoiceStatus = Static<typeof InvoiceStatus>;
export type InvoiceService = Static<typeof InvoiceService>;
export type InvoicePartyBusinessType = Static<typeof InvoicePartyBusinessType>;
export type InvoicePartyType = Static<typeof InvoicePartyType>;
