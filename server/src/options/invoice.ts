import {
  getInvoiceResponseSchema,
  getInvoicesResponseSchema,
  getInvoicesRevenueResponseSchema,
  getInvoicesTotalAmountResponseSchema,
  getLatestInvoicesResponseSchema,
  getNextInvoiceNumberResponseSchema,
  getPublicInvoiceSigningResponseSchema,
  invoiceBodySchema,
  invoiceNumberSeriesSchema,
  messageResponseSchema,
  postInvoiceResponseSchema,
  signInvoiceResponseSchema,
  updateInvoiceResponseSchema
} from '@invoicetrackr/types';
import { RouteShorthandOptionsWithHandler } from 'fastify';
import z from 'zod/v4';

import {
  deleteInvoice,
  getInvoice,
  getInvoices,
  getInvoicesRevenue,
  getInvoicesTotalAmount,
  getLatestInvoices,
  getNextInvoiceNumber,
  getPublicInvoiceSigning,
  postInvoice,
  sendInvoiceEmail,
  signPublicInvoice,
  updateInvoice,
  updateInvoiceStatus
} from '../controllers/invoice';
import { authMiddleware } from '../middleware/auth';
import { preValidateFileAndFields } from '../utils/multipart';

export const getInvoicesOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: getInvoicesResponseSchema
    }
  },
  preHandler: authMiddleware,
  handler: getInvoices
};

export const getInvoiceOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: getInvoiceResponseSchema
    }
  },
  preHandler: authMiddleware,
  handler: getInvoice
};

export const getNextInvoiceNumberOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    querystring: z.object({
      series: invoiceNumberSeriesSchema.optional()
    }),
    response: {
      200: getNextInvoiceNumberResponseSchema
    }
  },
  preHandler: authMiddleware,
  handler: getNextInvoiceNumber
};

export const postInvoiceOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: invoiceBodySchema.safeExtend({ file: z.any().nullish() }),
    response: {
      201: postInvoiceResponseSchema
    }
  },
  preHandler: authMiddleware,
  preValidation: preValidateFileAndFields,
  handler: postInvoice
};

export const updateInvoiceOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: invoiceBodySchema.safeExtend({ file: z.any().nullish() }),
    response: {
      200: updateInvoiceResponseSchema
    }
  },
  preHandler: authMiddleware,
  preValidation: preValidateFileAndFields,
  handler: updateInvoice
};

export const updateInvoiceStatusOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: z.object({ status: z.string() }),
    response: {
      200: messageResponseSchema
    }
  },
  preHandler: authMiddleware,
  handler: updateInvoiceStatus
};

export const deleteInvoiceOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: messageResponseSchema
    }
  },
  preHandler: authMiddleware,
  handler: deleteInvoice
};

export const getInvoicesTotalAmountOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: getInvoicesTotalAmountResponseSchema
    }
  },
  preHandler: authMiddleware,
  handler: getInvoicesTotalAmount
};

export const getInvoicesRevenueOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: getInvoicesRevenueResponseSchema
    }
  },
  preHandler: authMiddleware,
  handler: getInvoicesRevenue
};

export const getLatestInvoicesOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: getLatestInvoicesResponseSchema
    }
  },
  preHandler: authMiddleware,
  handler: getLatestInvoices
};

export const sendInvoiceEmailOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: messageResponseSchema
    },
    body: z.object({
      recipientEmail: z.email('validation.invoice.recipientEmail'),
      subject: z.string().min(1, 'validation.invoice.subject'),
      message: z.string().max(1000, 'validation.invoice.message').optional(),
      file: z.any().nullish()
    })
  },
  preHandler: authMiddleware,
  preValidation: preValidateFileAndFields,
  handler: sendInvoiceEmail
};

export const getPublicInvoiceSigningOptions: RouteShorthandOptionsWithHandler =
  {
    schema: {
      response: {
        200: getPublicInvoiceSigningResponseSchema
      }
    },
    handler: getPublicInvoiceSigning
  };

export const signPublicInvoiceOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: z.object({
      file: z.any().nullish()
    }),
    response: {
      200: signInvoiceResponseSchema
    }
  },
  preValidation: preValidateFileAndFields,
  handler: signPublicInvoice
};
