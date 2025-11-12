import { Static, Type } from '@sinclair/typebox';

export const BankAccount = Type.Object({
  id: Type.Optional(Type.Number()),
  name: Type.String({
    minLength: 1,
    maxLength: 255,
    errorMessage: 'validation.bankingInformation.name'
  }),
  code: Type.String({
    minLength: 1,
    maxLength: 255,
    errorMessage: 'validation.bankingInformation.code'
  }),
  accountNumber: Type.String({
    minLength: 1,
    maxLength: 255,
    errorMessage: 'validation.bankingInformation.accountNumber'
  })
});

export type BankAccountModel = Static<typeof BankAccount>;
