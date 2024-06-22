import { Type } from '@sinclair/typebox';
import {
  deleteInvoice,
  getInvoice,
  getInvoices,
  postInvoice,
  updateInvoice,
} from '../controllers';
import { Invoice } from '../types/models';
import { RouteShorthandOptionsWithHandler } from 'fastify';

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
      200: Invoice,
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
  handler: postInvoice,
};

export const updateInvoiceOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: Invoice,
    response: {
      200: Type.Object({ invoice: Invoice, message: Type.String() }),
    },
  },
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
