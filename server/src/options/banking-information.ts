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
import { requirePaidEntitlement } from '../middleware/entitlement';

const paidAccess = [authMiddleware, requirePaidEntitlement];

export const getBankAccountsOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: getBankAccountsResponseSchema
    }
  },
  preHandler: paidAccess,
  handler: getBankAccounts
};

export const getBankAccountOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: getBankAccountResponseSchema
    }
  },
  preHandler: paidAccess,
  handler: getBankAccount
};

export const postBankAccountOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: bankAccountBodySchema,
    response: {
      201: postBankAccountResponseSchema
    }
  },
  preHandler: paidAccess,
  handler: postBankAccount
};

export const updateBankAccountOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: bankAccountBodySchema,
    response: {
      200: updateBankAccountResponseSchema
    }
  },
  preHandler: paidAccess,
  handler: updateBankAccount
};

export const deleteBankAccountOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: messageResponseSchema
    }
  },
  preHandler: paidAccess,
  handler: deleteBankAccount
};
