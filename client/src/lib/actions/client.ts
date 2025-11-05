'use server';

import { revalidatePath } from 'next/cache';

import { addClient, deleteClient, updateClient } from '@/api';

import { ClientFormData, ClientModel } from '../types/models/client';
import { CLIENTS_PAGE } from '../constants/pages';

export const addClientAction = async ({
  userId,
  clientData
}: {
  userId: number;
  clientData: ClientFormData;
}) => {
  const response = await addClient(userId, clientData);

  revalidatePath(CLIENTS_PAGE);

  return response;
};

export const updateClientAction = async ({
  userId,
  clientData
}: {
  userId: number;
  clientData: ClientModel;
}) => {
  const response = await updateClient(userId, clientData);

  revalidatePath(CLIENTS_PAGE);
  return response;
};

export const deleteClientAction = async ({
  userId,
  clientId
}: {
  userId: number;
  clientId: number;
}) => {
  const response = await deleteClient(userId, clientId);

  revalidatePath(CLIENTS_PAGE);
  return response;
};
