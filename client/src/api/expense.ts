import {
  DeleteExpenseResponse,
  ExpenseInput,
  GetExpenseAttachmentResponse,
  GetExpenseAttachmentsResponse,
  GetExpenseResponse,
  GetExpensesResponse,
  MessageResponse,
  PostExpenseAttachmentResponse,
  PostExpenseResponse,
  UpdateExpenseAttachmentResponse,
  UpdateExpenseResponse
} from '@invoicetrackr/types';

import api from './api-instance';

export const getExpenses = async (userId: number) =>
  await api.get<GetExpensesResponse>(`/api/${userId}/expenses`);

export const getExpense = async ({
  userId,
  expenseId
}: {
  userId: number;
  expenseId: number;
}) => await api.get<GetExpenseResponse>(`/api/${userId}/expenses/${expenseId}`);

export const addExpense = async ({
  userId,
  expense
}: {
  userId: number;
  expense: Omit<
    ExpenseInput,
    | 'id'
    | 'deductibleAmount'
    | 'attachmentCount'
    | 'deletedAt'
    | 'createdAt'
    | 'updatedAt'
  >;
}) => await api.post<PostExpenseResponse>(`/api/${userId}/expenses`, expense);

export const updateExpense = async ({
  userId,
  expenseId,
  expense
}: {
  userId: number;
  expenseId: number;
  expense: Omit<
    ExpenseInput,
    | 'id'
    | 'deductibleAmount'
    | 'attachmentCount'
    | 'deletedAt'
    | 'createdAt'
    | 'updatedAt'
  >;
}) =>
  await api.put<UpdateExpenseResponse>(
    `/api/${userId}/expenses/${expenseId}`,
    expense
  );

export const deleteExpense = async ({
  userId,
  expenseId
}: {
  userId: number;
  expenseId: number;
}) =>
  await api.delete<DeleteExpenseResponse>(
    `/api/${userId}/expenses/${expenseId}`
  );

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
