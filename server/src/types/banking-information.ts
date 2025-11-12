import { Static, Type } from '@sinclair/typebox';

export const BankAccount = Type.Object({
  id: Type.Optional(Type.Number()),
  name: Type.String({
    minLength: 1,
    maxLength: 255,
    errorMessage: 'validation.bankAccount.name'
  }),
  code: Type.String({
    minLength: 1,
    maxLength: 255,
    errorMessage: 'validation.bankAccount.code'
  }),
  accountNumber: Type.String({
    minLength: 1,
    maxLength: 255,
    errorMessage: 'validation.bankAccount.accountNumber'
  })
});

export type BankAccountModel = Static<typeof BankAccount>;
