import { Static, Type } from '@sinclair/typebox';

export const InvoiceService = Type.Object({
  id: Type.Optional(Type.Number()),
  description: Type.String({
    minLength: 1,
    maxLength: 200,
    errorMessage: 'validation.invoice.services.description'
  }),
  unit: Type.String({
    minLength: 1,
    maxLength: 20,
    errorMessage: 'validation.invoice.services.unit'
  }),
  quantity: Type.Number({
    minimum: 0.0001,
    maximum: 10000,
    errorMessage: 'validation.invoice.services.quantity'
  }),
  amount: Type.Number({
    minimum: 0.01,
    maximum: 1000000,
    errorMessage: 'validation.invoice.services.amount'
  })
});

export const InvoiceStatus = Type.Union(
  [Type.Literal('paid'), Type.Literal('pending'), Type.Literal('canceled')],
  { errorMessage: 'validation.invoice.status' }
);

export const InvoicePartyBusinessType = Type.Union(
  [Type.Literal('business'), Type.Literal('individual')],
  { errorMessage: 'validation.invoice.businessType' }
);

export const InvoicePartyType = Type.Union(
  [Type.Literal('sender'), Type.Literal('receiver')],
  { errorMessage: 'validation.invoice.partyType' }
);

export const Invoice = Type.Object({
  id: Type.Optional(Type.Number()),
  invoiceId: Type.String({
    format: 'regex',
    pattern: '^[A-Za-z]{3}(0[0-9]{2}|[1-9][0-9]{2}|[1-9]0{2})$',
    errorMessage: 'validation.invoice.invoiceId'
  }),
  date: Type.String({
    format: 'date',
    errorMessage: 'validation.invoice.date'
  }),
  sender: Type.Object(
    {
      id: Type.Optional(Type.Number()),
      type: InvoicePartyType,
      name: Type.String({ minLength: 1, errorMessage: 'validation.invoice.sender.name' }),
      businessType: InvoicePartyBusinessType,
      businessNumber: Type.String({ minLength: 1, errorMessage: 'validation.invoice.sender.businessNumber' }),
      address: Type.String({ minLength: 1, errorMessage: 'validation.invoice.sender.address' }),
      email: Type.Optional(Type.String({ format: 'email', errorMessage: 'validation.invoice.sender.email' })),
      signature: Type.Optional(Type.String()),
      selectedBankAccountId: Type.Optional(Type.Number()),
      password: Type.Optional(Type.String()),
      profilePictureUrl: Type.Optional(Type.String()),
      currency: Type.Optional(Type.String()),
      language: Type.Optional(Type.String())
    },
    { errorMessage: 'validation.invoice.sender.required' }
  ),
  // TODO: Update senderSignature type
  senderSignature: Type.Optional(Type.Any()),
  // senderSignature: Type.Union(
  //   [Type.String(), Type.Object({ size: Type.Number(), type: Type.String() })],
  //   { errorMessage: 'Signature is required' }
  // ),
  receiver: Type.Object(
    {
      id: Type.Optional(Type.Number()),
      type: InvoicePartyType,
      name: Type.String({ minLength: 1, errorMessage: 'validation.invoice.receiver.name' }),
      businessType: InvoicePartyBusinessType,
      businessNumber: Type.String({
        minLength: 1,
        errorMessage: 'validation.invoice.receiver.businessNumber'
      }),
      address: Type.String({
        minLength: 1,
        errorMessage: 'validation.invoice.receiver.address'
      }),
      email: Type.Optional(
        Type.String({
          format: 'email',
          errorMessage: 'validation.invoice.receiver.email'
        })
      )
    },
    {
      minProperties: 1,
      errorMessage: 'validation.invoice.receiver.required'
    }
  ),
  totalAmount: Type.Number({ errorMessage: 'validation.invoice.totalAmount' }),
  status: InvoiceStatus,
  services: Type.Array(InvoiceService, {
    minItems: 1,
    maxItems: 100,
    errorMessage: 'validation.invoice.services.required'
  }),
  dueDate: Type.String({
    format: 'date',
    errorMessage: 'validation.invoice.dueDate'
  }),
  bankingInformation: Type.Object(
    {
      id: Type.Optional(Type.Number()),
      name: Type.String({ minLength: 1, errorMessage: 'validation.invoice.bankingInformation.name' }),
      code: Type.String({ minLength: 1, errorMessage: 'validation.invoice.bankingInformation.code' }),
      accountNumber: Type.String({ minLength: 1, errorMessage: 'validation.invoice.bankingInformation.accountNumber' })
    },
    {
      minProperties: 1,
      errorMessage: 'validation.invoice.bankingInformation.required'
    }
  )
});

export type InvoiceModel = Static<typeof Invoice>;
export type InvoiceStatus = Static<typeof InvoiceStatus>;
export type InvoiceService = Static<typeof InvoiceService>;
export type InvoicePartyBusinessType = Static<typeof InvoicePartyBusinessType>;
export type InvoicePartyType = Static<typeof InvoicePartyType>;
