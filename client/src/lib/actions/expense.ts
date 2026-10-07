'use server';

import type { ExpenseAttachment, ExpenseBody, ExpenseInput } from '@invoicetrackr/types';
import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';

import {
  addExpense,
  deleteExpense,
  deleteExpenseAttachment,
  getExpenseAttachment,
  getExpenseAttachments,
  replaceExpenseAttachment,
  updateExpense,
  uploadExpenseAttachment
} from '@/api/expense';

import { DASHBOARD_PAGE, EXPENSE_WORKSPACE_PAGE, EXPENSES_PAGE } from '../constants/pages';
import type { ActionResponseModel } from '../types/action';
import { isResponseError } from '../utils/error';
import { mapValidationErrors } from '../utils/validation';

const revalidateExpense = (expenseId: number) => {
  revalidatePath(EXPENSES_PAGE);
  revalidatePath(DASHBOARD_PAGE);
  revalidatePath(EXPENSE_WORKSPACE_PAGE(expenseId));
};

type ExpenseMutationData = Omit<
  ExpenseInput,
  | 'id'
  | 'deductibleAmount'
  | 'attachmentCount'
  | 'deletedAt'
  | 'createdAt'
  | 'updatedAt'
>;

export const addExpenseAction = async ({
  userId,
  expenseData
}: {
  userId: number;
  expenseData: ExpenseMutationData;
}): Promise<ActionResponseModel<ExpenseBody>> => {
  const response = await addExpense({ userId, expense: expenseData });

  if (isResponseError(response)) {
    return {
      ok: false,
      message: response.data.message,
      validationErrors: mapValidationErrors(response.data.errors)
    };
  }

  revalidatePath(EXPENSES_PAGE);
  revalidatePath(DASHBOARD_PAGE);

  return {
    ok: true,
    message: response.data.message,
    data: response.data.expense
  };
};

export const updateExpenseAction = async ({
  userId,
  expenseId,
  expenseData
}: {
  userId: number;
  expenseId: number;
  expenseData: ExpenseMutationData;
}): Promise<ActionResponseModel<ExpenseBody>> => {
  const response = await updateExpense({
    userId,
    expenseId,
    expense: expenseData
  });

  if (isResponseError(response)) {
    return {
      ok: false,
      message: response.data.message,
      validationErrors: mapValidationErrors(response.data.errors)
    };
  }

  revalidateExpense(expenseId);

  return {
    ok: true,
    message: response.data.message,
    data: response.data.expense
  };
};

export const deleteExpenseAction = async ({
  userId,
  expenseId
}: {
  userId: number;
  expenseId: number;
}): Promise<ActionResponseModel> => {
  const response = await deleteExpense({ userId, expenseId });

  if (isResponseError(response)) {
    return {
      ok: false,
      message: response.data.message
    };
  }

  revalidateExpense(expenseId);

  return { ok: true, message: response.data.message };
};

export const uploadExpenseAttachmentAction = async ({
  userId,
  expenseId,
  formData
}: {
  userId: number;
  expenseId: number;
  formData: FormData;
}): Promise<ActionResponseModel<ExpenseAttachment>> => {
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return {
      ok: false,
      message: (await getTranslations('expenses.workspace.documents'))('select_file')
    };
  }

  const response = await uploadExpenseAttachment({ userId, expenseId, file });

  if (isResponseError(response)) {
    return {
      ok: false,
      message: response.data.message
    };
  }

  revalidateExpense(expenseId);

  return { ok: true, message: response.data.message, data: response.data.attachment };
};

export const getExpenseAttachmentsAction = async (
  userId: number, expenseId: number
): Promise<ActionResponseModel<ExpenseAttachment[]>> => {
  const response = await getExpenseAttachments(userId, expenseId);
  if (isResponseError(response)) return { ok: false, message: response.data.message };
  return { ok: true, message: '', data: response.data.attachments };
};

export const getExpenseAttachmentAction = async (
  params: { userId: number; expenseId: number; attachmentId: number }
): Promise<ActionResponseModel<ExpenseAttachment>> => {
  const response = await getExpenseAttachment(params);
  if (isResponseError(response)) return { ok: false, message: response.data.message };
  return { ok: true, message: '', data: response.data.attachment };
};

export const replaceExpenseAttachmentAction = async ({
  userId, expenseId, attachmentId, formData
}: { userId: number; expenseId: number; attachmentId: number; formData: FormData }
): Promise<ActionResponseModel<ExpenseAttachment>> => {
  const file = formData.get('file');
  if (!(file instanceof File)) return {
    ok: false, message: (await getTranslations('expenses.workspace.documents'))('select_file')
  };
  const response = await replaceExpenseAttachment({ userId, expenseId, attachmentId, file });
  if (isResponseError(response)) return { ok: false, message: response.data.message };
  revalidateExpense(expenseId);
  return { ok: true, message: response.data.message, data: response.data.attachment };
};

export const deleteExpenseAttachmentAction = async (
  params: { userId: number; expenseId: number; attachmentId: number }
): Promise<ActionResponseModel> => {
  const response = await deleteExpenseAttachment(params);
  if (isResponseError(response)) return { ok: false, message: response.data.message };
  revalidateExpense(params.expenseId);
  return { ok: true, message: response.data.message };
};
