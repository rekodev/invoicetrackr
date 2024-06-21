import { Type } from '@sinclair/typebox';
import {
  deleteInvoice,
  getInvoice,
  getInvoices,
  postInvoice,
  updateInvoice,
} from '../controllers';
import { Invoice } from '../types/models';

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
      201: Type.Object({ invoice: Invoice, message: Type.String() }),
    },
  },
  handler: postInvoice,
};

export const updateInvoiceOptions = {
  schema: {
    response: {
      200: Type.Object({ invoice: Invoice, message: Type.String() }),
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
