import {
  AddInvoiceResp,
  DeleteInvoiceResp,
  GetInvoiceResp,
  GetInvoicesResp,
  GetInvoicesRevenueResp,
  GetInvoicesTotalAmountResp,
  GetLatestInvoicesResp,
  SendInvoiceEmailResp,
  UpdateInvoiceResp,
  UpdateInvoiceStatusResp
} from '@/lib/types/response/invoice';
import { InvoiceFormData, InvoiceModel } from '@/lib/types/models/invoice';

import api from './api-instance';

export const getInvoice = async (userId: number, invoiceId: number) =>
  await api.get<GetInvoiceResp>(`/api/${userId}/invoices/${invoiceId}`);

export const getInvoices = async (userId: number) =>
  await api.get<GetInvoicesResp>(`/api/${userId}/invoices`);

export const getInvoicesTotalAmount = async (userId: number) =>
  await api.get<GetInvoicesTotalAmountResp>(
    `/api/${userId}/invoices/total-amount`
  );

export const getInvoicesRevenue = async (userId: number) =>
  await api.get<GetInvoicesRevenueResp>(`/api/${userId}/invoices/revenue`);

export const getLatestInvoices = async (userId: number) =>
  await api.get<GetLatestInvoicesResp>(`/api/${userId}/invoices/latest`);

export const addInvoice = async (
  userId: number,
  invoiceData: InvoiceFormData
) => {
  const isSignatureFile = typeof invoiceData.senderSignature !== 'string';

  return await api.post<AddInvoiceResp>(
    `/api/${userId}/invoices`,
    invoiceData,
    {
      headers: {
        'Content-Type': isSignatureFile
          ? 'multipart/form-data'
          : 'application/json'
      }
    }
  );
};

export const updateInvoice = async (
  userId: number,
  invoiceData: InvoiceModel
) => {
  const isSignatureFile = typeof invoiceData.senderSignature !== 'string';

  return await api.put<UpdateInvoiceResp>(
    `/api/${userId}/invoices/${invoiceData.id}`,
    invoiceData,
    {
      headers: {
        'Content-Type': isSignatureFile
          ? 'multipart/form-data'
          : 'application/json'
      }
    }
  );
};

export const updateInvoiceStatus = async ({
  userId,
  invoiceId,
  newStatus
}: {
  userId: number;
  invoiceId: number;
  newStatus: 'paid' | 'pending' | 'canceled';
}) =>
  api.put<UpdateInvoiceStatusResp>(
    `/api/${userId}/invoices/${invoiceId}/status`,
    { status: newStatus }
  );

export const deleteInvoice = async (userId: number, invoiceId: number) =>
  await api.delete<DeleteInvoiceResp>(`/api/${userId}/invoices/${invoiceId}`);

export const sendInvoiceEmail = async ({
  id,
  userId,
  invoiceId,
  recipientEmail,
  subject,
  message,
  blob
}: {
  id: number;
  userId: number;
  invoiceId: string;
  recipientEmail: string;
  subject: string;
  message?: string;
  blob: Blob | null;
}) => {
  const formData = new FormData();
  formData.append('recipientEmail', recipientEmail);
  formData.append('subject', subject);
  if (message) {
    formData.append('message', message);
  }
  if (blob) {
    formData.append(
      'pdfAttachment',
      new File([blob], `${invoiceId}.pdf`, { type: 'application/pdf' })
    );
  }

  return await api.post<SendInvoiceEmailResp>(
    `/api/${userId}/invoices/${id}/send-email`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
};
