'use server';

import { revalidatePath } from 'next/cache';

import {
  addInvoice,
  deleteInvoice,
  updateInvoice,
  updateInvoiceStatus
} from '@/api';

import { EDIT_INVOICE_PAGE, INVOICES_PAGE } from '../constants/pages';
import { InvoiceModel } from '../types/models/invoice';

export const addInvoiceAction = async ({
  userId,
  invoiceData,
  lang
}: {
  userId: number;
  invoiceData: InvoiceModel;
  lang: string;
}) => {
  const response = await addInvoice(userId, invoiceData, lang);

  revalidatePath(INVOICES_PAGE);
  return response;
};

export const updateInvoiceAction = async ({
  userId,
  invoiceData,
  lang
}: {
  userId: number;
  invoiceData: InvoiceModel;
  lang: string;
}) => {
  const response = await updateInvoice(userId, invoiceData, lang);

  revalidatePath(EDIT_INVOICE_PAGE(invoiceData.id));
  revalidatePath(INVOICES_PAGE);
  return response;
};

export const updateInvoiceStatusAction = async ({
  userId,
  invoiceId,
  newStatus
}: {
  userId: number;
  invoiceId: number;
  newStatus: 'paid' | 'pending' | 'canceled';
}) => {
  const response = await updateInvoiceStatus({ userId, invoiceId, newStatus });

  revalidatePath(INVOICES_PAGE);
  return response;
};

export const deleteInvoiceAction = async ({
  userId,
  invoiceId
}: {
  userId: number;
  invoiceId: number;
}) => {
  const response = await deleteInvoice(userId, invoiceId);

  revalidatePath(INVOICES_PAGE);
  return response;
};
