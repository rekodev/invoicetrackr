import { Type } from '@sinclair/typebox';
import { RouteShorthandOptionsWithHandler } from 'fastify';

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
} from '../controllers';
import { Invoice } from '../types';
import { MessageResponse } from '../types/response';
import { preValidateFileAndFields } from '../utils/multipart';
import { authMiddleware } from '../middleware/auth';

export const getInvoicesOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: Type.Object({ invoices: Type.Array(Invoice) })
    }
  },
  preHandler: authMiddleware,
  handler: getInvoices
};

export const getInvoiceOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: Type.Object({ invoice: Invoice })
    }
  },
  preHandler: authMiddleware,
  handler: getInvoice
};

export const postInvoiceOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: Invoice,
    response: {
      201: Type.Intersect([
        Type.Object({ invoice: Invoice }),
        MessageResponse
      ])
    }
  },
  preHandler: authMiddleware,
  preValidation: preValidateFileAndFields,
  handler: postInvoice
};

export const updateInvoiceOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: Invoice,
    response: {
      200: Type.Intersect([
        Type.Object({ invoice: Invoice }),
        MessageResponse
      ])
    }
  },
  preHandler: authMiddleware,
  preValidation: preValidateFileAndFields,
  handler: updateInvoice
};

export const updateInvoiceStatusOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: Type.Object({ status: Type.String() }),
    response: {
      200: MessageResponse
    }
  },
  preHandler: authMiddleware,
  preValidation: preValidateFileAndFields,
  handler: updateInvoiceStatus
};

export const deleteInvoiceOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: MessageResponse
    }
  },
  preHandler: authMiddleware,
  handler: deleteInvoice
};

export const getInvoicesTotalAmountOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: Type.Object({
        invoices: Type.Array(
          Type.Object({ totalAmount: Type.String(), status: Type.String() })
        ),
        totalClients: Type.Number()
      })
    }
  },
  preHandler: authMiddleware,
  handler: getInvoicesTotalAmount
};

export const getInvoicesRevenueOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: Type.Object({
        revenueByMonth: Type.Record(Type.Number(), Type.Number())
      })
    }
  },
  preHandler: authMiddleware,
  handler: getInvoicesRevenue
};

export const getLatestInvoicesOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: Type.Object({
        invoices: Type.Array(
          Type.Object({
            id: Type.Number(),
            totalAmount: Type.String(),
            name: Type.String(),
            email: Type.String(),
            invoiceId: Type.String()
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
      200: MessageResponse
    },
    params: Type.Object({
      id: Type.String(),
      userId: Type.String()
    }),
    body: Type.Object({
      recipientEmail: Type.String({
        format: 'email',
        errorMessage: 'validation.invoice.email.format'
      }),
      subject: Type.String({
        minLength: 1,
        errorMessage: 'validation.invoice.email.subject'
      }),
      message: Type.Optional(
        Type.String({
          maxLength: 1000,
          errorMessage: 'validation.invoice.email.message'
        })
      )
    })
  },
  preHandler: authMiddleware,
  preValidation: preValidateFileAndFields,
  handler: sendInvoiceEmail
};
