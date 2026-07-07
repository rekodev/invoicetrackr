import {
  GetExpenseAttachmentResponse,
  GetExpenseAttachmentsResponse,
  MessageResponse,
  PostExpenseAttachmentResponse,
  UpdateExpenseAttachmentResponse
} from '@invoicetrackr/types';

import api from './api-instance';

export const getExpenseAttachments = async (
  userId: number,
  expenseId: number
) =>
  await api.get<GetExpenseAttachmentsResponse>(
    `/api/${userId}/expenses/${expenseId}/attachments`
  );

export const getExpenseAttachment = async ({
  userId,
  expenseId,
  attachmentId
}: {
  userId: number;
  expenseId: number;
  attachmentId: number;
}) =>
  await api.get<GetExpenseAttachmentResponse>(
    `/api/${userId}/expenses/${expenseId}/attachments/${attachmentId}`
  );

export const uploadExpenseAttachment = async ({
  userId,
  expenseId,
  file
}: {
  userId: number;
  expenseId: number;
  file: File;
}) => {
  const formData = new FormData();
  formData.append('file', file);

  return await api.post<PostExpenseAttachmentResponse>(
    `/api/${userId}/expenses/${expenseId}/attachments`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
};

export const replaceExpenseAttachment = async ({
  userId,
  expenseId,
  attachmentId,
  file
}: {
  userId: number;
  expenseId: number;
  attachmentId: number;
  file: File;
}) => {
  const formData = new FormData();
  formData.append('file', file);

  return await api.put<UpdateExpenseAttachmentResponse>(
    `/api/${userId}/expenses/${expenseId}/attachments/${attachmentId}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
};

export const deleteExpenseAttachment = async ({
  userId,
  expenseId,
  attachmentId
}: {
  userId: number;
  expenseId: number;
  attachmentId: number;
}) =>
  await api.delete<MessageResponse>(
    `/api/${userId}/expenses/${expenseId}/attachments/${attachmentId}`
  );
