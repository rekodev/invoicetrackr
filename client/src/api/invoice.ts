import {
  AddInvoiceResponse,
  DeleteInvoiceResponse,
  GetInvoiceResponse,
  GetInvoicesResponse,
  GetInvoicesRevenueResponse,
  GetInvoicesTotalAmountResponse,
  GetLatestInvoicesResponse,
  SendInvoiceEmailResponse,
  UpdateInvoiceResponse,
  UpdateInvoiceStatusResponse
} from '@invoicetrackr/types';
import { InvoiceBody } from '@invoicetrackr/types';

import api from './api-instance';
import { buildFormData } from '@/lib/utils/multipart';

export const getInvoice = async (userId: number, invoiceId: number) =>
  await api.get<GetInvoiceResponse>(`/api/${userId}/invoices/${invoiceId}`);

export const getInvoices = async (userId: number) =>
  await api.get<GetInvoicesResponse>(`/api/${userId}/invoices`);

export const getInvoicesTotalAmount = async (userId: number) =>
  await api.get<GetInvoicesTotalAmountResponse>(
    `/api/${userId}/invoices/total-amount`
  );

export const getInvoicesRevenue = async (userId: number) =>
  await api.get<GetInvoicesRevenueResponse>(`/api/${userId}/invoices/revenue`);

export const getLatestInvoices = async (userId: number) =>
  await api.get<GetLatestInvoicesResponse>(`/api/${userId}/invoices/latest`);

export const addInvoice = async (userId: number, invoiceData: InvoiceBody) => {
  const hasFile = invoiceData.senderSignature instanceof File;

  if (hasFile) {
    const { senderSignature, ...dataWithoutFile } = invoiceData;
    const formData = buildFormData(dataWithoutFile);
    formData.append('file', senderSignature);

    return await api.post<AddInvoiceResponse>(
      `/api/${userId}/invoices`,
      formData
    );
  }

  return await api.post<AddInvoiceResponse>(
    `/api/${userId}/invoices`,
    invoiceData
  );
};

export const updateInvoice = async (
  userId: number,
  invoiceData: InvoiceBody
) => {
  const hasFile = invoiceData.senderSignature instanceof File;

  if (hasFile) {
    const { senderSignature, ...dataWithoutFile } = invoiceData;
    const formData = buildFormData(dataWithoutFile);
    formData.append('file', senderSignature);

    return await api.put<UpdateInvoiceResponse>(
      `/api/${userId}/invoices/${invoiceData.id}`,
      formData
    );
  }

  return await api.put<UpdateInvoiceResponse>(
    `/api/${userId}/invoices/${invoiceData.id}`,
    invoiceData
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
  api.put<UpdateInvoiceStatusResponse>(
    `/api/${userId}/invoices/${invoiceId}/status`,
    { status: newStatus }
  );

export const deleteInvoice = async (userId: number, invoiceId: number) =>
  await api.delete<DeleteInvoiceResponse>(
    `/api/${userId}/invoices/${invoiceId}`
  );

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

  return await api.post<SendInvoiceEmailResponse>(
    `/api/${userId}/invoices/${id}/send-email`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
};
