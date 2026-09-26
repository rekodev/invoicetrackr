'use server';

import type { InvoiceBody, InvoicePaymentBody, SendInvoiceEmailBody } from '@invoicetrackr/types';
import { revalidatePath } from 'next/cache';

import {
  addInvoice,
  createInvoicePayment,
  createRecipientDetailsRequest,
  deleteInvoice,
  deleteInvoicePayment,
  getNextInvoiceNumber,
  issueInvoice,
  recoverInvoiceEmail,
  sendInvoiceEmail,
  updateInvoice,
  updateInvoicePayment,
  updateInvoiceStatus
} from '@/api/invoice';

import {
  EDIT_INVOICE_PAGE,
  INVOICE_WORKSPACE_PAGE,
  INVOICES_PAGE
} from '../constants/pages';
import type { ActionResponseModel } from '../types/action';
import { isResponseError } from '../utils/error';
import { mapValidationErrors } from '../utils/validation';

export const sendInvoiceEmailAction = async (userId: number, invoiceId: number, body: SendInvoiceEmailBody) => {
  const response = await sendInvoiceEmail(userId, invoiceId, body);
  revalidatePath(INVOICE_WORKSPACE_PAGE(invoiceId));
  if (isResponseError(response)) return { ok: false as const, message: response.data.message,
    validationErrors: mapValidationErrors(response.data.errors), transportUnknown: response.status >= 500 || response.data.code === 'unknown_error' };
  return { ok: true as const, ...response.data };
};

export const recoverInvoiceEmailAction = async (userId: number, invoiceId: number, deliveryId: number) => {
  const response = await recoverInvoiceEmail(userId, invoiceId, deliveryId);
  revalidatePath(INVOICE_WORKSPACE_PAGE(invoiceId));
  if (isResponseError(response)) return { ok: false as const, message: response.data.message,
    validationErrors: mapValidationErrors(response.data.errors), transportUnknown: response.status >= 500 || response.data.code === 'unknown_error' };
  return { ok: true as const, ...response.data };
};

export const getNextInvoiceNumberAction = async ({
  userId,
  series
}: {
  userId: number;
  series?: string;
}) => {
  const response = await getNextInvoiceNumber(userId, series);

  if (isResponseError(response)) {
    return {
      ok: false,
      message: response.data.message
    };
  }

  return {
    ok: true,
    invoiceId: response.data.invoiceId,
    series: response.data.series,
    nextNumber: response.data.nextNumber
  };
};

export const addInvoiceAction = async ({
  userId,
  invoiceData
}: {
  userId: number;
  invoiceData: InvoiceBody;
}): Promise<ActionResponseModel> => {
  const response = await addInvoice(userId, invoiceData);

  if (isResponseError(response)) {
    return {
      ok: false,
      message: response.data.message,
      validationErrors: mapValidationErrors(response.data.errors)
    };
  }

  revalidatePath(INVOICES_PAGE);

  return { ok: true, message: response.data.message };
};

export const updateInvoiceAction = async ({
  userId,
  invoiceData
}: {
  userId: number;
  invoiceData: InvoiceBody;
}): Promise<ActionResponseModel> => {
  const response = await updateInvoice(userId, invoiceData);

  if (isResponseError(response)) {
    return {
      ok: false,
      message: response.data.message,
      validationErrors: mapValidationErrors(response.data.errors)
    };
  }

  revalidatePath(EDIT_INVOICE_PAGE(Number(invoiceData.id)));
  revalidatePath(INVOICES_PAGE);
  revalidatePath(INVOICE_WORKSPACE_PAGE(Number(invoiceData.id)));

  return { ok: true, message: response.data.message };
};

export const updateInvoiceStatusAction = async ({
  userId,
  invoiceId,
  newStatus
}: {
  userId: number;
  invoiceId: number;
  newStatus: 'canceled';
}): Promise<ActionResponseModel> => {
  const response = await updateInvoiceStatus({ userId, invoiceId, newStatus });

  if (isResponseError(response)) {
    return {
      ok: false,
      message: response.data.message,
      validationErrors: mapValidationErrors(response.data.errors)
    };
  }

  revalidatePath(INVOICES_PAGE);
  revalidatePath(INVOICE_WORKSPACE_PAGE(invoiceId));

  return { ok: true, message: response.data.message };
};

export const issueInvoiceAction = async (userId: number, invoiceId: number) => {
  const response = await issueInvoice(userId, invoiceId);
  revalidatePath(INVOICES_PAGE);
  revalidatePath(INVOICE_WORKSPACE_PAGE(invoiceId));
  return isResponseError(response)
    ? { ok: false, message: response.data.message }
    : { ok: true, message: response.data.message };
};

export const saveInvoicePaymentAction = async ({
  userId,
  invoiceId,
  paymentId,
  payment
}: {
  userId: number;
  invoiceId: number;
  paymentId?: number;
  payment: InvoicePaymentBody;
}) => {
  const response = paymentId
    ? await updateInvoicePayment(userId, invoiceId, paymentId, payment)
    : await createInvoicePayment(userId, invoiceId, payment);
  if (isResponseError(response))
    return { ok: false, message: response.data.message };
  revalidatePath(INVOICE_WORKSPACE_PAGE(invoiceId));
  revalidatePath(INVOICES_PAGE);
  revalidatePath('/dashboard');
  return { ok: true, message: '' };
};

export const removeInvoicePaymentAction = async (
  userId: number,
  invoiceId: number,
  paymentId: number
) => {
  const response = await deleteInvoicePayment(userId, invoiceId, paymentId);
  if (isResponseError(response))
    return { ok: false, message: response.data.message };
  revalidatePath(INVOICE_WORKSPACE_PAGE(invoiceId));
  revalidatePath(INVOICES_PAGE);
  revalidatePath('/dashboard');
  return { ok: true, message: response.data.message };
};

export const createRecipientDetailsRequestAction = async (
  userId: number,
  invoiceId: number,
  recipientEmail?: string,
  sendEmail = false
) => {
  const response = await createRecipientDetailsRequest(
    userId,
    invoiceId,
    recipientEmail,
    sendEmail
  );
  revalidatePath(INVOICES_PAGE);
  return isResponseError(response)
    ? { ok: false, message: response.data.message }
    : {
        ok: true,
        message: response.data.message,
        data: { url: response.data.url }
      };
};

export const deleteInvoiceAction = async ({
  userId,
  invoiceId
}: {
  userId: number;
  invoiceId: number;
}): Promise<ActionResponseModel> => {
  const response = await deleteInvoice(userId, invoiceId);

  if (isResponseError(response)) {
    return {
      ok: false,
      message: response.data.message
    };
  }

  revalidatePath(INVOICES_PAGE);

  return { ok: true, message: response.data.message };
};
