import { bankAccountSchema } from '../types/banking-information';
import { messageResponseSchema } from '../types/response';
import {
  deleteBankAccount,
  getBankAccount,
  getBankAccounts,
  postBankAccount,
  updateBankAccount
} from '../controllers/banking-information';
import { RouteShorthandOptionsWithHandler } from 'fastify';
import { authMiddleware } from '../middleware/auth';
import z from 'zod/v4';

export const getBankAccountsOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: z.object({ bankAccounts: z.array(bankAccountSchema) })
    }
  },
  preHandler: authMiddleware,
  handler: getBankAccounts
};

export const getBankAccountOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: bankAccountSchema
    }
  },
  preHandler: authMiddleware,
  handler: getBankAccount
};

export const postBankAccountOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: bankAccountSchema,
    response: {
      201: z.union([
        z.object({ bankAccount: bankAccountSchema }),
        messageResponseSchema
      ])
    }
  },
  preHandler: authMiddleware,
  handler: postBankAccount
};

export const updateBankAccountOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: bankAccountSchema,
    response: {
      200: z.intersection(
        z.object({ bankAccount: bankAccountSchema }),
        messageResponseSchema
      )
    }
  },
  preHandler: authMiddleware,
  handler: updateBankAccount
};

export const deleteBankAccountOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: messageResponseSchema
    }
  },
  preHandler: authMiddleware,
  handler: deleteBankAccount
};
