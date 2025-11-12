'use server';

import { revalidatePath } from 'next/cache';

import { addClient, deleteClient, updateClient } from '@/api/client';

import { ClientFormData, ClientModel } from '../types/models/client';
import { ActionResponseModel } from '../types/response/action';
import { CLIENTS_PAGE } from '../constants/pages';
import { isResponseError } from '../utils/error';
import { mapValidationErrors } from '../utils/validation';

export const addClientAction = async ({
  userId,
  clientData
}: {
  userId: number;
  clientData: ClientFormData;
}): Promise<ActionResponseModel> => {
  const response = await addClient(userId, clientData);

  if (isResponseError(response)) {
    return {
      ok: false,
      message: response.data.message,
      validationErrors: mapValidationErrors(response.data.errors)
    };
  }

  revalidatePath(CLIENTS_PAGE);

  return { ok: true, message: response.data.message };
};

export const updateClientAction = async ({
  userId,
  clientData
}: {
  userId: number;
  clientData: ClientModel;
}): Promise<ActionResponseModel> => {
  const response = await updateClient(userId, clientData);

  if (isResponseError(response)) {
    return {
      ok: false,
      message: response.data.message,
      validationErrors: mapValidationErrors(response.data.errors)
    };
  }

  revalidatePath(CLIENTS_PAGE);

  return { ok: true, message: response.data.message };
};

export const deleteClientAction = async ({
  userId,
  clientId
}: {
  userId: number;
  clientId: number;
}): Promise<ActionResponseModel> => {
  const response = await deleteClient(userId, clientId);

  if (isResponseError(response)) {
    return {
      ok: false,
      message: response.data.message
    };
  }

  revalidatePath(CLIENTS_PAGE);

  return { ok: true, message: response.data.message };
};
