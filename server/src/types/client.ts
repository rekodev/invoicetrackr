import { Static, Type } from '@sinclair/typebox';
import { InvoicePartyBusinessType, InvoicePartyType } from './invoice';

export const Client = Type.Object({
  id: Type.Number(),
  type: InvoicePartyType,
  name: Type.String({ minLength: 1, errorMessage: 'validation.client.name' }),
  businessType: InvoicePartyBusinessType,
  businessNumber: Type.String({
    minLength: 1,
    errorMessage: 'validation.client.businessNumber'
  }),
  address: Type.String({
    minLength: 1,
    errorMessage: 'validation.client.address'
  }),
  email: Type.Union([
    Type.String({ maxLength: 0 }),
    Type.String({
      minLength: 1,
      format: 'email',
      errorMessage: 'validation.client.email'
    })
  ])
});

export type ClientModel = Static<typeof Client>;
