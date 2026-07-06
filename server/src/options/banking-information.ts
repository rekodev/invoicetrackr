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

const authenticatedAccess = [authMiddleware];

export const getBankAccountsOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: getBankAccountsResponseSchema
    }
  },
  preHandler: authenticatedAccess,
  handler: getBankAccounts
};

export const getBankAccountOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: getBankAccountResponseSchema
    }
  },
  preHandler: authenticatedAccess,
  handler: getBankAccount
};

export const postBankAccountOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: bankAccountBodySchema,
    response: {
      201: postBankAccountResponseSchema
    }
  },
  preHandler: authenticatedAccess,
  handler: postBankAccount
};

export const updateBankAccountOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: bankAccountBodySchema,
    response: {
      200: updateBankAccountResponseSchema
    }
  },
  preHandler: authenticatedAccess,
  handler: updateBankAccount
};

export const deleteBankAccountOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: messageResponseSchema
    }
  },
  preHandler: authenticatedAccess,
  handler: deleteBankAccount
};
