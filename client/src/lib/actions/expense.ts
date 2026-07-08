'use server';

import type { ExpenseInput } from '@invoicetrackr/types';
import { revalidatePath } from 'next/cache';

import {
  addExpense,
  deleteExpense,
  updateExpense,
  uploadExpenseAttachment
} from '@/api/expense';

import type { ActionResponseModel } from '../types/action';
import { EXPENSES_PAGE } from '../constants/pages';
import { isResponseError } from '../utils/error';
import { mapValidationErrors } from '../utils/validation';

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
}): Promise<ActionResponseModel> => {
  const response = await addExpense({ userId, expense: expenseData });

  if (isResponseError(response)) {
    return {
      ok: false,
      message: response.data.message,
      validationErrors: mapValidationErrors(response.data.errors)
    };
  }

  revalidatePath(EXPENSES_PAGE);

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
}): Promise<ActionResponseModel> => {
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

  revalidatePath(EXPENSES_PAGE);

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

  revalidatePath(EXPENSES_PAGE);

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
}): Promise<ActionResponseModel> => {
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return {
      ok: false,
      message: 'Select a document to upload'
    };
  }

  const response = await uploadExpenseAttachment({ userId, expenseId, file });

  if (isResponseError(response)) {
    return {
      ok: false,
      message: response.data.message
    };
  }

  revalidatePath(EXPENSES_PAGE);

  return { ok: true, message: response.data.message };
};
