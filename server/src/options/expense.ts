import {
  expenseAttachmentParamsSchema,
  expenseBodySchema,
  expenseParamsSchema,
  getExpenseAttachmentResponseSchema,
  getExpenseAttachmentsResponseSchema,
  getExpenseResponseSchema,
  getExpensesResponseSchema,
  messageResponseSchema,
  postExpenseAttachmentResponseSchema,
  postExpenseResponseSchema,
  updateExpenseAttachmentResponseSchema,
  updateExpenseResponseSchema
} from '@invoicetrackr/types';
import { RouteShorthandOptionsWithHandler } from 'fastify';
import z from 'zod/v4';

import {
  deleteExpense,
  deleteExpenseAttachment,
  getExpense,
  getExpenseAttachment,
  getExpenseAttachments,
  getExpenses,
  postExpense,
  postExpenseAttachment,
  replaceExpenseAttachment,
  updateExpense
} from '../controllers/expense';
import { authMiddleware } from '../middleware/auth';
import { preValidateFileAndFields } from '../utils/multipart';

const authenticatedAccess = [authMiddleware];
const expenseAttachmentBodySchema = z.object({ file: z.any().nullish() });
const userParamsSchema = z.object({ userId: z.string() });

export const getExpensesOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    params: userParamsSchema,
    response: {
      200: getExpensesResponseSchema
    }
  },
  preHandler: authenticatedAccess,
  handler: getExpenses
};

export const getExpenseOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    params: expenseParamsSchema,
    response: {
      200: getExpenseResponseSchema
    }
  },
  preHandler: authenticatedAccess,
  handler: getExpense
};

export const postExpenseOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    params: userParamsSchema,
    body: expenseBodySchema.omit({
      id: true,
      deductibleAmount: true,
      attachmentCount: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true
    }),
    response: {
      201: postExpenseResponseSchema
    }
  },
  preHandler: authenticatedAccess,
  handler: postExpense
};

export const updateExpenseOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    params: expenseParamsSchema,
    body: expenseBodySchema.omit({
      deductibleAmount: true,
      attachmentCount: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true
    }),
    response: {
      200: updateExpenseResponseSchema
    }
  },
  preHandler: authenticatedAccess,
  handler: updateExpense
};

export const deleteExpenseOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    params: expenseParamsSchema,
    response: {
      200: messageResponseSchema
    }
  },
  preHandler: authenticatedAccess,
  handler: deleteExpense
};

export const getExpenseAttachmentsOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    params: expenseParamsSchema,
    response: {
      200: getExpenseAttachmentsResponseSchema
    }
  },
  preHandler: authenticatedAccess,
  handler: getExpenseAttachments
};

export const getExpenseAttachmentOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    params: expenseAttachmentParamsSchema,
    response: {
      200: getExpenseAttachmentResponseSchema
    }
  },
  preHandler: authenticatedAccess,
  handler: getExpenseAttachment
};

export const postExpenseAttachmentOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    params: expenseParamsSchema,
    body: expenseAttachmentBodySchema,
    response: {
      201: postExpenseAttachmentResponseSchema
    }
  },
  preHandler: authenticatedAccess,
  preValidation: preValidateFileAndFields,
  handler: postExpenseAttachment
};

export const replaceExpenseAttachmentOptions: RouteShorthandOptionsWithHandler =
  {
    schema: {
      params: expenseAttachmentParamsSchema,
      body: expenseAttachmentBodySchema,
      response: {
        200: updateExpenseAttachmentResponseSchema
      }
    },
    preHandler: authenticatedAccess,
    preValidation: preValidateFileAndFields,
    handler: replaceExpenseAttachment
  };

export const deleteExpenseAttachmentOptions: RouteShorthandOptionsWithHandler =
  {
    schema: {
      params: expenseAttachmentParamsSchema,
      response: {
        200: messageResponseSchema
      }
    },
    preHandler: authenticatedAccess,
    handler: deleteExpenseAttachment
  };
