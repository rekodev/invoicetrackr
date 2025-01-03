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
  updateInvoice,
} from '../controllers';
import { Invoice } from '../types/models';
import { preValidateFileAndFields } from '../utils/multipart';

export const getInvoicesOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: Type.Array(Invoice),
    },
  },
  handler: getInvoices,
};

export const getInvoiceOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: Type.Object({ invoice: Invoice }),
    },
  },
  handler: getInvoice,
};

export const postInvoiceOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: Invoice,
    response: {
      201: Type.Object({ invoice: Invoice, message: Type.String() }),
    },
  },
  preValidation: preValidateFileAndFields,
  handler: postInvoice,
};

export const updateInvoiceOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: Invoice,
    response: {
      200: Type.Object({ invoice: Invoice, message: Type.String() }),
    },
  },
  preValidation: preValidateFileAndFields,
  handler: updateInvoice,
};

export const deleteInvoiceOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: Type.Object({ message: Type.String() }),
    },
  },
  handler: deleteInvoice,
};

export const getInvoicesTotalAmountOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: Type.Object({
        invoices: Type.Array(
          Type.Object({ totalAmount: Type.String(), status: Type.String() })
        ),
        totalClients: Type.Number(),
      }),
    },
  },
  handler: getInvoicesTotalAmount,
};

export const getInvoicesRevenueOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: Type.Object({
        revenueByMonth: Type.Record(Type.Number(), Type.Number()),
      }),
    },
  },
  handler: getInvoicesRevenue,
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
          })
        ),
      }),
    },
  },
  handler: getLatestInvoices,
};
