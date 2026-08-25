'use server';

import type { ClientMutationBody } from '@invoicetrackr/types';
import { revalidatePath } from 'next/cache';

import { addClient, archiveClient, updateClient } from '@/api/client';

import { CLIENTS_PAGE } from '../constants/pages';
import { ActionResponseModel } from '../types/action';
import { isResponseError } from '../utils/error';
import { mapValidationErrors } from '../utils/validation';

type ClientFormData = Omit<ClientMutationBody, 'duplicateAcknowledged'>;

export const addClientAction = async ({
  userId,
  clientData,
  duplicateAcknowledged = false
}: {
  userId: number;
  clientData: ClientFormData;
  duplicateAcknowledged?: boolean;
}): Promise<ActionResponseModel> => {
  const response = await addClient(userId, {
    ...clientData,
    duplicateAcknowledged
  });

  if (isResponseError(response)) {
    return {
      ok: false,
      message: response.data.message,
      code: response.data.code,
      validationErrors: mapValidationErrors(response.data.errors)
    };
  }

  revalidatePath(CLIENTS_PAGE);

  return { ok: true, message: response.data.message };
};

export const updateClientAction = async ({
  userId,
  clientData,
  duplicateAcknowledged = false
}: {
  userId: number;
  clientData: ClientFormData;
  duplicateAcknowledged?: boolean;
}): Promise<ActionResponseModel> => {
  const response = await updateClient(userId, {
    ...clientData,
    duplicateAcknowledged
  });

  if (isResponseError(response)) {
    return {
      ok: false,
      message: response.data.message,
      code: response.data.code,
      validationErrors: mapValidationErrors(response.data.errors)
    };
  }

  revalidatePath(CLIENTS_PAGE);

  return { ok: true, message: response.data.message };
};

export const archiveClientAction = async ({
  userId,
  clientId
}: {
  userId: number;
  clientId: number;
}): Promise<ActionResponseModel> => {
  const response = await archiveClient(userId, clientId);

  if (isResponseError(response)) {
    return {
      ok: false,
      message: response.data.message
    };
  }

  revalidatePath(CLIENTS_PAGE);

  return { ok: true, message: response.data.message };
};
