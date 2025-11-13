import {
  bankAccountBodySchema,
  getBankAccountResponseSchema,
  getBankAccountsResponseSchema,
  messageResponseSchema,
  postBankAccountResponseSchema,
  updateBankAccountResponseSchema
} from '@invoicetrackr/types';
import { RouteShorthandOptionsWithHandler } from 'fastify';

import {
  deleteBankAccount,
  getBankAccount,
  getBankAccounts,
  postBankAccount,
  updateBankAccount
} from '../controllers/banking-information';
import { authMiddleware } from '../middleware/auth';

export const getBankAccountsOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: getBankAccountsResponseSchema
    }
  },
  preHandler: authMiddleware,
  handler: getBankAccounts
};

export const getBankAccountOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: getBankAccountResponseSchema
    }
  },
  preHandler: authMiddleware,
  handler: getBankAccount
};

export const postBankAccountOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: bankAccountBodySchema,
    response: {
      201: postBankAccountResponseSchema
    }
  },
  preHandler: authMiddleware,
  handler: postBankAccount
};

export const updateBankAccountOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: bankAccountBodySchema,
    response: {
      200: updateBankAccountResponseSchema
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
