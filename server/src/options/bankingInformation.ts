import { Type } from "@sinclair/typebox";
import { BankAccount } from "../types/models";
import {
  deleteBankAccount,
  getBankAccount,
  getBankAccounts,
  postBankAccount,
  updateBankAccount,
} from "../controllers";
import { RouteShorthandOptionsWithHandler } from "fastify";
import { authMiddleware } from "../middleware/auth";

export const getBankAccountsOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: Type.Array(BankAccount),
    },
  },
  preHandler: authMiddleware,
  handler: getBankAccounts,
};

export const getBankAccountOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: BankAccount,
    },
  },
  preHandler: authMiddleware,
  handler: getBankAccount,
};

export const postBankAccountOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: BankAccount,
    response: {
      201: Type.Object({ bankAccount: BankAccount, message: Type.String() }),
    },
  },
  preHandler: authMiddleware,
  handler: postBankAccount,
};

export const updateBankAccountOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: BankAccount,
    response: {
      200: Type.Object({ bankAccount: BankAccount, message: Type.String() }),
    },
  },
  preHandler: authMiddleware,
  handler: updateBankAccount,
};

export const deleteBankAccountOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: Type.Object({ message: Type.String() }),
    },
  },
  preHandler: authMiddleware,
  handler: deleteBankAccount,
};
