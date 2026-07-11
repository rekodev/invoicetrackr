import {
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
  regeneratePublicInvoiceLinkResponseSchema,
  sendInvoiceEmailBodySchema,
  signInvoiceResponseSchema,
  updateInvoiceResponseSchema
} from '@invoicetrackr/types';
import { RouteShorthandOptionsWithHandler } from 'fastify';
import z from 'zod/v4';

import { authMiddleware, requireVerifiedEmail } from '../middleware/auth';
import {
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
  regeneratePublicInvoice,
  revokeInvoiceSigning,
  revokePublicInvoice,
  sendInvoiceEmail,
  signPublicInvoice,
  updateInvoice,
  updateInvoiceStatus
} from '../controllers/invoice';
import { preValidateFileAndFields } from '../utils/multipart';

const authenticatedAccess = [authMiddleware];

export const getInvoicesOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: getInvoicesResponseSchema
    }
  },
  preHandler: authenticatedAccess,
  handler: getInvoices
};

export const getIncomeJournalOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    querystring: incomeJournalQuerySchema
  },
  preHandler: authenticatedAccess,
  handler: getIncomeJournal
};

export const getInvoiceOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: getInvoiceResponseSchema
    }
  },
  preHandler: authenticatedAccess,
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
  preHandler: authenticatedAccess,
  handler: getNextInvoiceNumber
};

export const postInvoiceOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: invoiceBodySchema.safeExtend({ file: z.any().nullish() }),
    response: {
      201: postInvoiceResponseSchema
    }
  },
  preHandler: authenticatedAccess,
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
  preHandler: authenticatedAccess,
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
  preHandler: authenticatedAccess,
  handler: updateInvoiceStatus
};

export const deleteInvoiceOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: messageResponseSchema
    }
  },
  preHandler: authenticatedAccess,
  handler: deleteInvoice
};

export const getInvoicesTotalAmountOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: getInvoicesTotalAmountResponseSchema
    }
  },
  preHandler: authenticatedAccess,
  handler: getInvoicesTotalAmount
};

export const getInvoicesRevenueOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: getInvoicesRevenueResponseSchema
    }
  },
  preHandler: authenticatedAccess,
  handler: getInvoicesRevenue
};

export const getLatestInvoicesOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: getLatestInvoicesResponseSchema
    }
  },
  preHandler: authenticatedAccess,
  handler: getLatestInvoices
};

export const sendInvoiceEmailOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: messageResponseSchema
    },
    body: sendInvoiceEmailBodySchema
  },
  preHandler: [...authenticatedAccess, requireVerifiedEmail],
  preValidation: preValidateFileAndFields,
  handler: sendInvoiceEmail
};

export const revokePublicInvoiceOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: messageResponseSchema
    }
  },
  preHandler: authenticatedAccess,
  handler: revokePublicInvoice
};

export const regeneratePublicInvoiceOptions: RouteShorthandOptionsWithHandler =
  {
    schema: {
      response: {
        200: regeneratePublicInvoiceLinkResponseSchema
      }
    },
    preHandler: authenticatedAccess,
    handler: regeneratePublicInvoice
  };

export const revokeInvoiceSigningOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: messageResponseSchema
    }
  },
  preHandler: authenticatedAccess,
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
    preHandler: authenticatedAccess,
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
