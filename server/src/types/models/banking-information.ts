import { Static, Type } from '@sinclair/typebox';

export const BankAccount = Type.Object({
  id: Type.Optional(Type.Number()),
  name: Type.String({
    minLength: 1,
    maxLength: 255,
    errorMessage: 'Bank name is required'
  }),
  code: Type.String({
    minLength: 1,
    maxLength: 255,
    errorMessage: 'Bank code is required'
  }),
  accountNumber: Type.String({
    minLength: 1,
    maxLength: 255,
    errorMessage: 'Bank account number is required'
  })
});

export type BankAccountModel = Static<typeof BankAccount>;
