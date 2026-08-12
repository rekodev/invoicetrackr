'use server';

import type { InvoiceBody } from '@invoicetrackr/types';
import { revalidatePath } from 'next/cache';

import {
  addInvoice,
  createRecipientDetailsRequest,
  deleteInvoice,
  getNextInvoiceNumber,
  issueInvoice,
  updateInvoice,
  updateInvoiceStatus
} from '@/api/invoice';

import { EDIT_INVOICE_PAGE, INVOICES_PAGE } from '../constants/pages';
import type { ActionResponseModel } from '../types/action';
import { isResponseError } from '../utils/error';
import { mapValidationErrors } from '../utils/validation';

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

  return { ok: true, message: response.data.message };
};

export const updateInvoiceStatusAction = async ({
  userId,
  invoiceId,
  newStatus
}: {
  userId: number;
  invoiceId: number;
  newStatus: 'paid' | 'pending' | 'canceled';
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

  return { ok: true, message: response.data.message };
};

export const issueInvoiceAction = async (userId: number, invoiceId: number) => {
  const response = await issueInvoice(userId, invoiceId);
  revalidatePath(INVOICES_PAGE);
  return isResponseError(response)
    ? { ok: false, message: response.data.message }
    : { ok: true, message: response.data.message };
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
