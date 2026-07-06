import type {
  AddInvoiceResponse,
  CreateInvoiceCorrectionResponse,
  DeleteInvoiceResponse,
  GetInvoiceResponse,
  GetInvoicesResponse,
  GetInvoicesRevenueResponse,
  GetInvoicesTotalAmountResponse,
  GetLatestInvoicesResponse,
  GetNextInvoiceNumberResponse,
  GetPublicInvoiceResponse,
  GetPublicInvoiceSigningResponse,
  RegenerateInvoiceSigningLinkResponse,
  RegeneratePublicInvoiceLinkResponse,
  RevokeInvoiceSigningLinkResponse,
  RevokePublicInvoiceLinkResponse,
  SendInvoiceEmailResponse,
  SignInvoiceResponse,
  UpdateInvoiceResponse,
  UpdateInvoiceStatusResponse
} from '@invoicetrackr/types';
import type { InvoiceBody } from '@invoicetrackr/types';
import type { InvoiceCorrectionType } from '@invoicetrackr/types';

import api from './api-instance';
import { buildFormData } from '@/lib/utils/multipart';

export const getInvoice = async (userId: number, invoiceId: number) =>
  await api.get<GetInvoiceResponse>(`/api/${userId}/invoices/${invoiceId}`);

export const getPublicInvoiceSigning = async (token: string) =>
  await api.get<GetPublicInvoiceSigningResponse>(`/api/invoices/sign/${token}`);

export const getPublicInvoice = async (token: string) =>
  await api.get<GetPublicInvoiceResponse>(`/api/invoices/public/${token}`);

export const getInvoices = async (userId: number) =>
  await api.get<GetInvoicesResponse>(`/api/${userId}/invoices`);

export const getIncomeJournalExport = async ({
  userId,
  from,
  to
}: {
  userId: number;
  from: string;
  to: string;
}) =>
  await api.get<Blob>(`/api/${userId}/invoices/income-journal.csv`, {
    params: { from, to },
    responseType: 'blob'
  });

export const getInvoicesTotalAmount = async (userId: number) =>
  await api.get<GetInvoicesTotalAmountResponse>(
    `/api/${userId}/invoices/total-amount`
  );

export const getInvoicesRevenue = async (userId: number) =>
  await api.get<GetInvoicesRevenueResponse>(`/api/${userId}/invoices/revenue`);

export const getLatestInvoices = async (userId: number) =>
  await api.get<GetLatestInvoicesResponse>(`/api/${userId}/invoices/latest`);

export const getNextInvoiceNumber = async (userId: number, series?: string) => {
  const query = series ? `?series=${encodeURIComponent(series)}` : '';

  return await api.get<GetNextInvoiceNumberResponse>(
    `/api/${userId}/invoices/next-number${query}`
  );
};

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

export const createInvoiceCorrection = async ({
  userId,
  invoiceId,
  type,
  reason
}: {
  userId: number;
  invoiceId: number;
  type: InvoiceCorrectionType;
  reason?: string;
}) =>
  await api.post<CreateInvoiceCorrectionResponse>(
    `/api/${userId}/invoices/${invoiceId}/corrections`,
    { type, reason }
  );

export const deleteInvoice = async (userId: number, invoiceId: number) =>
  await api.delete<DeleteInvoiceResponse>(
    `/api/${userId}/invoices/${invoiceId}`
  );

export const signPublicInvoice = async ({
  token,
  signature
}: {
  token: string;
  signature: File;
}) => {
  const formData = new FormData();
  formData.append('file', signature);

  return await api.post<SignInvoiceResponse>(
    `/api/invoices/sign/${token}`,
    formData
  );
};

export const revokeInvoiceSigningLink = async (
  userId: number,
  invoiceId: number
) =>
  await api.post<RevokeInvoiceSigningLinkResponse>(
    `/api/${userId}/invoices/${invoiceId}/signing-link/revoke`
  );

export const regenerateInvoiceSigningLink = async ({
  userId,
  invoiceId,
  recipientEmail
}: {
  userId: number;
  invoiceId: number;
  recipientEmail: string;
}) =>
  await api.post<RegenerateInvoiceSigningLinkResponse>(
    `/api/${userId}/invoices/${invoiceId}/signing-link/regenerate`,
    { recipientEmail }
  );

export const revokePublicInvoiceLink = async (
  userId: number,
  invoiceId: number
) =>
  await api.post<RevokePublicInvoiceLinkResponse>(
    `/api/${userId}/invoices/${invoiceId}/public-link/revoke`
  );

export const regeneratePublicInvoiceLink = async (
  userId: number,
  invoiceId: number
) =>
  await api.post<RegeneratePublicInvoiceLinkResponse>(
    `/api/${userId}/invoices/${invoiceId}/public-link/regenerate`
  );

export const sendInvoiceEmail = async ({
  id,
  userId,
  invoiceId,
  recipientEmail,
  subject,
  message,
  includePublicLink,
  requestSignature,
  blob
}: {
  id: number;
  userId: number;
  invoiceId: string;
  recipientEmail: string;
  subject: string;
  message?: string;
  includePublicLink?: boolean;
  requestSignature?: boolean;
  blob: Blob | null;
}) => {
  const formData = new FormData();
  formData.append('recipientEmail', recipientEmail);
  formData.append('subject', subject);
  if (message) {
    formData.append('message', message);
  }
  formData.append('includePublicLink', String(includePublicLink ?? true));
  formData.append('requestSignature', String(!!requestSignature));
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
