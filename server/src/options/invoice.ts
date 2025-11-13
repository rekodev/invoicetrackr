import { RouteShorthandOptionsWithHandler } from 'fastify';
import z from 'zod/v4';

import {
  deleteInvoice,
  getInvoice,
  getInvoices,
  getInvoicesRevenue,
  getInvoicesTotalAmount,
  getLatestInvoices,
  postInvoice,
  sendInvoiceEmail,
  updateInvoice,
  updateInvoiceStatus
} from '../controllers/invoice';
import { invoiceSchema } from '../types/invoice';
import { messageResponseSchema } from '../types/response';
import { preValidateFileAndFields } from '../utils/multipart';
import { authMiddleware } from '../middleware/auth';

export const getInvoicesOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: z.object({ invoices: z.array(invoiceSchema) })
    }
  },
  preHandler: authMiddleware,
  handler: getInvoices
};

export const getInvoiceOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: z.object({ invoice: invoiceSchema })
    }
  },
  preHandler: authMiddleware,
  handler: getInvoice
};

export const postInvoiceOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: invoiceSchema,
    response: {
      201: z.intersection(
        z.object({ invoice: invoiceSchema }),
        messageResponseSchema
      )
    }
  },
  preHandler: authMiddleware,
  preValidation: preValidateFileAndFields,
  handler: postInvoice
};

export const updateInvoiceOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: invoiceSchema,
    response: {
      200: z.intersection(
        z.object({ invoice: invoiceSchema }),
        messageResponseSchema
      )
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
  preValidation: preValidateFileAndFields,
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
      200: z.object({
        invoices: z.array(
          z.object({ totalAmount: z.string(), status: z.string() })
        ),
        totalClients: z.number()
      })
    }
  },
  preHandler: authMiddleware,
  handler: getInvoicesTotalAmount
};

export const getInvoicesRevenueOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: z.object({
        revenueByMonth: z.record(z.string(), z.number())
      })
    }
  },
  preHandler: authMiddleware,
  handler: getInvoicesRevenue
};

export const getLatestInvoicesOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: z.object({
        invoices: z.array(
          z.object({
            id: z.number(),
            totalAmount: z.string(),
            name: z.string(),
            email: z.string(),
            invoiceId: z.string()
          })
        )
      })
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
    params: z.object({
      id: z.string(),
      userId: z.string()
    }),
    body: z.object({
      recipientEmail: z.string().email('validation.invoice.recipientEmail'),
      subject: z.string().min(1, 'validation.invoice.subject'),
      message: z.string().max(1000, 'validation.invoice.message').optional()
    })
  },
  preHandler: authMiddleware,
  preValidation: preValidateFileAndFields,
  handler: sendInvoiceEmail
};
