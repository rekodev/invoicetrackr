import {
  invoicePaymentBodySchema,
  invoicePaymentResponseSchema,
  invoiceWorkspaceResponseSchema,
  messageResponseSchema
} from '@invoicetrackr/types';
import type { RouteShorthandOptionsWithHandler } from 'fastify';
import z from 'zod/v4';

import {
  createInvoicePayment,
  deleteInvoicePayment,
  getInvoiceWorkspace,
  updateInvoicePayment
} from '../controllers/invoice-workspace';
import { authMiddleware } from '../middleware/auth';

const numericParam = z.string().regex(/^[1-9]\d*$/);
const params = z.object({ userId: numericParam, id: numericParam });
const paymentParams = params.extend({ paymentId: numericParam });

export const getInvoiceWorkspaceOptions: RouteShorthandOptionsWithHandler = {
  schema: { params, response: { 200: invoiceWorkspaceResponseSchema } },
  preHandler: [authMiddleware],
  handler: getInvoiceWorkspace
};
export const createInvoicePaymentOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    params,
    body: invoicePaymentBodySchema,
    response: { 201: invoicePaymentResponseSchema }
  },
  preHandler: [authMiddleware],
  handler: createInvoicePayment
};
export const updateInvoicePaymentOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    params: paymentParams,
    body: invoicePaymentBodySchema,
    response: { 200: invoicePaymentResponseSchema }
  },
  preHandler: [authMiddleware],
  handler: updateInvoicePayment
};
export const deleteInvoicePaymentOptions: RouteShorthandOptionsWithHandler = {
  schema: { params: paymentParams, response: { 200: messageResponseSchema } },
  preHandler: [authMiddleware],
  handler: deleteInvoicePayment
};
