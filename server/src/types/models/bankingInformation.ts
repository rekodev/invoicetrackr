import { Static, Type } from '@sinclair/typebox';

export const BankAccount = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  code: Type.String(),
  accountNumber: Type.String(),
});

export type BankAccountModel = Static<typeof BankAccount>;
