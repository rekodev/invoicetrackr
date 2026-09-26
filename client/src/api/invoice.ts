import type {
  AddInvoiceResponse,
  DeleteInvoiceResponse,
  GetInvoiceResponse,
  GetInvoicesResponse,
  GetInvoicesRevenueResponse,
  GetInvoicesTotalAmountResponse,
  GetLatestInvoicesResponse,
  GetNextInvoiceNumberResponse,
  GetPublicInvoiceResponse,
  GetPublicInvoiceSigningResponse,
  GetRecipientDetailsResponse,
  InvoicePaymentBody,
  InvoicePaymentResponse,
  InvoiceWorkspaceResponse,
  IssueInvoiceResponse,
  RecipientDetailsRequestResponse,
  RegenerateInvoiceSigningLinkResponse,
  RegeneratePublicInvoiceLinkResponse,
  RevokeInvoiceSigningLinkResponse,
  RevokePublicInvoiceLinkResponse,
  SendInvoiceDeliveryResponse,
  SendInvoiceEmailBody,
  SignInvoiceResponse,
  SubmitRecipientDetailsResponse,
  UpdateInvoiceResponse,
  UpdateInvoiceStatusResponse
} from '@invoicetrackr/types';
import type { InvoiceBody } from '@invoicetrackr/types';

import { buildFormData } from '@/lib/utils/multipart';

import api from './api-instance';

export const getInvoice = async (userId: number, invoiceId: number) =>
  await api.get<GetInvoiceResponse>(`/api/${userId}/invoices/${invoiceId}`);

export const getInvoiceWorkspace = (userId: number, invoiceId: number) =>
  api.get<InvoiceWorkspaceResponse>(
    `/api/${userId}/invoices/${invoiceId}/workspace`
  );

export const createInvoicePayment = (
  userId: number,
  invoiceId: number,
  payment: InvoicePaymentBody
) =>
  api.post<InvoicePaymentResponse>(
    `/api/${userId}/invoices/${invoiceId}/payments`,
    payment
  );

export const updateInvoicePayment = (
  userId: number,
  invoiceId: number,
  paymentId: number,
  payment: InvoicePaymentBody
) =>
  api.put<InvoicePaymentResponse>(
    `/api/${userId}/invoices/${invoiceId}/payments/${paymentId}`,
    payment
  );

export const deleteInvoicePayment = (
  userId: number,
  invoiceId: number,
  paymentId: number
) =>
  api.delete<{ message: string }>(
    `/api/${userId}/invoices/${invoiceId}/payments/${paymentId}`
  );

export const issueInvoice = (userId: number, invoiceId: number) =>
  api.post<IssueInvoiceResponse>(`/api/${userId}/invoices/${invoiceId}/issue`);

export const createRecipientDetailsRequest = (
  userId: number,
  invoiceId: number,
  recipientEmail?: string,
  sendEmail = false
) =>
  api.post<RecipientDetailsRequestResponse>(
    `/api/${userId}/invoices/${invoiceId}/recipient-details-request`,
    { recipientEmail, sendEmail }
  );

export const getRecipientDetailsRequest = (token: string) =>
  api.get<GetRecipientDetailsResponse>(`/api/invoices/details/${token}`);

export const submitRecipientDetails = (
  token: string,
  receiver: InvoiceBody['receiver'],
  signature?: File | string
) => {
  if (signature instanceof File) {
    const formData = buildFormData(receiver);
    formData.append('file', signature);

    return api.put<SubmitRecipientDetailsResponse>(
      `/api/invoices/details/${token}`,
      formData
    );
  }

  return api.put<SubmitRecipientDetailsResponse>(
    `/api/invoices/details/${token}`,
    receiver
  );
};

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
  newStatus: 'canceled';
}) =>
  api.put<UpdateInvoiceStatusResponse>(
    `/api/${userId}/invoices/${invoiceId}/status`,
    { status: newStatus }
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

export const sendInvoiceEmail = (userId: number, id: number, body: SendInvoiceEmailBody) =>
  api.post<SendInvoiceDeliveryResponse>(`/api/${userId}/invoices/${id}/send-email`, body);

export const recoverInvoiceEmail = (userId: number, id: number, deliveryId: number) =>
  api.post<SendInvoiceDeliveryResponse>(`/api/${userId}/invoices/${id}/email-deliveries/${deliveryId}/recover`);
