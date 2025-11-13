import {
  AddClientResponse,
  ClientBody,
  DeleteClientResponse,
  GetClientsResponse,
  UpdateClientResponse
} from '@invoicetrackr/types';

import api from './api-instance';

export const getClients = async (userId: number) =>
  await api.get<GetClientsResponse>(`/api/${userId}/clients`);

export const addClient = async (userId: number, clientData: ClientBody) =>
  await api.post<AddClientResponse>(`/api/${userId}/clients`, clientData);

export const updateClient = async (userId: number, clientData: ClientBody) =>
  await api.put<UpdateClientResponse>(
    `/api/${userId}/clients/${clientData.id}`,
    clientData
  );

export const deleteClient = async (userId: number, clientId: number) =>
  await api.delete<DeleteClientResponse>(`/api/${userId}/clients/${clientId}`);
