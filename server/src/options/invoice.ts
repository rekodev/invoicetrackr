import { Type } from '@sinclair/typebox';
import {
  deleteInvoice,
  getInvoice,
  getInvoices,
  postInvoice,
  updateInvoice,
} from '../controllers/invoice';
import { Invoice } from '../types/models/invoice';

export const getInvoicesOptions = {
  schema: {
    response: {
      200: Type.Array(Invoice),
    },
  },
  handler: getInvoices,
};

export const getInvoiceOptions = {
  schema: {
    response: {
      200: Invoice,
    },
  },
  handler: getInvoice,
};

export const postInvoiceOptions = {
  schema: {
    body: Invoice,
    response: {
      201: Invoice,
    },
  },
  handler: postInvoice,
};

export const updateInvoiceOptions = {
  schema: {
    response: {
      200: Invoice,
    },
  },
  handler: updateInvoice,
};

export const deleteInvoiceOptions = {
  schema: {
    response: {
      200: Type.Object({ message: Type.String() }),
    },
  },
  handler: deleteInvoice,
};
