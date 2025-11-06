'use server';

import { revalidatePath } from 'next/cache';

import {
  addInvoice,
  deleteInvoice,
  updateInvoice,
  updateInvoiceStatus
} from '@/api';

import { EDIT_INVOICE_PAGE, INVOICES_PAGE } from '../constants/pages';
import { ActionResponseModel } from '../types/response';
import { InvoiceModel } from '../types/models/invoice';
import { isResponseError } from '../utils/error';
import { mapValidationErrors } from '../utils/validation';

export const addInvoiceAction = async ({
  userId,
  invoiceData,
  lang
}: {
  userId: number;
  invoiceData: InvoiceModel;
  lang: string;
}): Promise<ActionResponseModel> => {
  const response = await addInvoice(userId, invoiceData, lang);

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
  invoiceData,
  lang
}: {
  userId: number;
  invoiceData: InvoiceModel;
  lang: string;
}): Promise<ActionResponseModel> => {
  const response = await updateInvoice(userId, invoiceData, lang);

  if (isResponseError(response)) {
    return {
      ok: false,
      message: response.data.message,
      validationErrors: mapValidationErrors(response.data.errors)
    };
  }

  revalidatePath(EDIT_INVOICE_PAGE(invoiceData.id));
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
      message: response.data.message,
      validationErrors: mapValidationErrors(response.data.errors)
    };
  }

  revalidatePath(INVOICES_PAGE);

  return { ok: true, message: response.data.message };
};
