import { Type } from '@sinclair/typebox';
import { BankAccount } from '../types/models';
import {
  deleteBankAccount,
  getBankAccount,
  getBankAccounts,
  postBankAccount,
  updateBankAccount,
} from '../controllers';

export const getBankAccountsOptions = {
  schema: {
    response: {
      200: Type.Array(BankAccount),
    },
  },
  handler: getBankAccounts,
};

export const getBankAccountOptions = {
  schema: {
    response: {
      200: BankAccount,
    },
  },
  handler: getBankAccount,
};

export const postBankAccountOptions = {
  schema: {
    body: Type.Omit(BankAccount, ['id']),
    response: {
      201: Type.Object({ bankAccount: BankAccount, message: Type.String() }),
    },
  },
  handler: postBankAccount,
};

export const updateBankAccountOptions = {
  schema: {
    body: BankAccount,
    response: {
      200: Type.Object({ bankAccount: BankAccount, message: Type.String() }),
    },
  },
  handler: updateBankAccount,
};

export const deleteBankAccountOptions = {
  schema: {
    response: {
      200: Type.Object({ message: Type.String() }),
    },
  },
  handler: deleteBankAccount,
};
