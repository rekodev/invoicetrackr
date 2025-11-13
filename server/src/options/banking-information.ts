import { bankAccountBodySchema } from '@invoicetrackr/types';
import { messageResponseSchema } from '@invoicetrackr/types';
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
      200: z.object({ bankAccounts: z.array(bankAccountBodySchema) })
    }
  },
  preHandler: authMiddleware,
  handler: getBankAccounts
};

export const getBankAccountOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: bankAccountBodySchema
    }
  },
  preHandler: authMiddleware,
  handler: getBankAccount
};

export const postBankAccountOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: bankAccountBodySchema,
    response: {
      201: z.union([
        z.object({ bankAccount: bankAccountBodySchema }),
        messageResponseSchema
      ])
    }
  },
  preHandler: authMiddleware,
  handler: postBankAccount
};

export const updateBankAccountOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: bankAccountBodySchema,
    response: {
      200: z.intersection(
        z.object({ bankAccount: bankAccountBodySchema }),
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
