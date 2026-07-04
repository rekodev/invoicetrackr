import {
  confirmPublicInvoicePaymentResponseSchema,
  createInvoiceCorrectionBodySchema,
  createInvoiceCorrectionResponseSchema,
  createPublicInvoicePaymentResponseSchema,
  getInvoiceResponseSchema,
  getInvoicesResponseSchema,
  getInvoicesRevenueResponseSchema,
  getInvoicesTotalAmountResponseSchema,
  getLatestInvoicesResponseSchema,
  getNextInvoiceNumberResponseSchema,
  getPublicInvoiceResponseSchema,
  getPublicInvoiceSigningResponseSchema,
  incomeJournalQuerySchema,
  invoiceBodySchema,
  invoiceNumberSeriesSchema,
  messageResponseSchema,
  postInvoiceResponseSchema,
  sendInvoiceEmailBodySchema,
  signInvoiceResponseSchema,
  updateInvoiceResponseSchema
} from '@invoicetrackr/types';
import { RouteShorthandOptionsWithHandler } from 'fastify';
import z from 'zod/v4';

import { authMiddleware, requireVerifiedEmail } from '../middleware/auth';
import {
  confirmPublicInvoicePayment,
  createInvoiceCorrection,
  createPublicInvoicePayment,
  deleteInvoice,
  getIncomeJournal,
  getInvoice,
  getInvoices,
  getInvoicesRevenue,
  getInvoicesTotalAmount,
  getLatestInvoices,
  getNextInvoiceNumber,
  getPublicInvoice,
  getPublicInvoiceSigning,
  postInvoice,
  regenerateInvoiceSigning,
  revokeInvoiceSigning,
  sendInvoiceEmail,
  signPublicInvoice,
  updateInvoice,
  updateInvoiceStatus
} from '../controllers/invoice';
import { preValidateFileAndFields } from '../utils/multipart';
import { requirePaidEntitlement } from '../middleware/entitlement';

const paidAccess = [authMiddleware, requirePaidEntitlement];

export const getInvoicesOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: getInvoicesResponseSchema
    }
  },
  preHandler: paidAccess,
  handler: getInvoices
};

export const getIncomeJournalOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    querystring: incomeJournalQuerySchema
  },
  preHandler: paidAccess,
  handler: getIncomeJournal
};

export const getInvoiceOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: getInvoiceResponseSchema
    }
  },
  preHandler: paidAccess,
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
  preHandler: paidAccess,
  handler: getNextInvoiceNumber
};

export const postInvoiceOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: invoiceBodySchema.safeExtend({ file: z.any().nullish() }),
    response: {
      201: postInvoiceResponseSchema
    }
  },
  preHandler: paidAccess,
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
  preHandler: paidAccess,
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
  preHandler: paidAccess,
  handler: updateInvoiceStatus
};

export const createInvoiceCorrectionOptions: RouteShorthandOptionsWithHandler =
  {
    schema: {
      body: createInvoiceCorrectionBodySchema,
      response: {
        201: createInvoiceCorrectionResponseSchema
      }
    },
    preHandler: paidAccess,
    handler: createInvoiceCorrection
  };

export const deleteInvoiceOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: messageResponseSchema
    }
  },
  preHandler: paidAccess,
  handler: deleteInvoice
};

export const getInvoicesTotalAmountOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: getInvoicesTotalAmountResponseSchema
    }
  },
  preHandler: paidAccess,
  handler: getInvoicesTotalAmount
};

export const getInvoicesRevenueOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: getInvoicesRevenueResponseSchema
    }
  },
  preHandler: paidAccess,
  handler: getInvoicesRevenue
};

export const getLatestInvoicesOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: getLatestInvoicesResponseSchema
    }
  },
  preHandler: paidAccess,
  handler: getLatestInvoices
};

export const sendInvoiceEmailOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: messageResponseSchema
    },
    body: sendInvoiceEmailBodySchema
  },
  preHandler: [...paidAccess, requireVerifiedEmail],
  preValidation: preValidateFileAndFields,
  handler: sendInvoiceEmail
};

export const revokeInvoiceSigningOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: messageResponseSchema
    }
  },
  preHandler: paidAccess,
  handler: revokeInvoiceSigning
};

export const regenerateInvoiceSigningOptions: RouteShorthandOptionsWithHandler =
  {
    schema: {
      body: z.object({
        recipientEmail: z.email('validation.invoice.recipientEmail')
      }),
      response: {
        200: messageResponseSchema
      }
    },
    preHandler: paidAccess,
    handler: regenerateInvoiceSigning
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

export const getPublicInvoiceOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: getPublicInvoiceResponseSchema
    }
  },
  handler: getPublicInvoice
};

export const createPublicInvoicePaymentOptions: RouteShorthandOptionsWithHandler =
  {
    schema: {
      response: {
        200: createPublicInvoicePaymentResponseSchema
      }
    },
    handler: createPublicInvoicePayment
  };

export const confirmPublicInvoicePaymentOptions: RouteShorthandOptionsWithHandler =
  {
    schema: {
      body: z.object({
        sessionId: z.string().min(1)
      }),
      response: {
        200: confirmPublicInvoicePaymentResponseSchema
      }
    },
    handler: confirmPublicInvoicePayment
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
