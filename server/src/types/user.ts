import { Static, Type } from '@sinclair/typebox';
import { InvoicePartyBusinessType, InvoicePartyType } from './invoice';

export const User = Type.Object({
  id: Type.Optional(Type.Number()),
  type: InvoicePartyType,
  name: Type.String({ minLength: 1, errorMessage: 'validation.user.name' }),
  businessType: InvoicePartyBusinessType,
  businessNumber: Type.String({
    minLength: 1,
    errorMessage: 'validation.user.businessNumber'
  }),
  address: Type.String({
    minLength: 1,
    errorMessage: 'validation.user.address'
  }),
  email: Type.Optional(
    Type.String({ format: 'email', errorMessage: 'validation.user.email' })
  ),
  signature: Type.Optional(Type.String()),
  selectedBankAccountId: Type.Optional(Type.Number()),
  password: Type.Optional(
    Type.String({ minLength: 1, errorMessage: 'validation.user.password' })
  ),
  profilePictureUrl: Type.String(),
  currency: Type.String({
    minLength: 1,
    errorMessage: 'validation.user.currency'
  }),
  language: Type.String({
    minLength: 1,
    errorMessage: 'validation.user.language'
  }),
  stripeCustomerId: Type.String(),
  stripeSubscriptionId: Type.String()
});

export type UserModel = Static<typeof User>;
