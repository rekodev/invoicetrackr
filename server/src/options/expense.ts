import {
  expenseAttachmentParamsSchema,
  expenseParamsSchema,
  getExpenseAttachmentResponseSchema,
  getExpenseAttachmentsResponseSchema,
  messageResponseSchema,
  postExpenseAttachmentResponseSchema,
  updateExpenseAttachmentResponseSchema
} from '@invoicetrackr/types';
import { RouteShorthandOptionsWithHandler } from 'fastify';
import z from 'zod/v4';

import {
  deleteExpenseAttachment,
  getExpenseAttachment,
  getExpenseAttachments,
  postExpenseAttachment,
  replaceExpenseAttachment
} from '../controllers/expense';
import { authMiddleware } from '../middleware/auth';
import { preValidateFileAndFields } from '../utils/multipart';

const authenticatedAccess = [authMiddleware];
const expenseAttachmentBodySchema = z.object({ file: z.any().nullish() });

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
