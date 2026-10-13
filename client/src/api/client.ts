import type {
  AddClientResponse,
  ArchiveClientResponse,
  ClientListQuery,
  ClientMutationBody,
  ClientWorkspaceResponse,
  GetClientsResponse,
  UpdateClientResponse
} from '@invoicetrackr/types';

import api from './api-instance';

export const getClients = async (userId: number, query: ClientListQuery = {}) =>
  await api.get<GetClientsResponse>(`/api/${userId}/clients`, {
    params: query
  });

export const getClientWorkspace = (userId: number, clientId: number) =>
  api.get<ClientWorkspaceResponse>(`/api/${userId}/clients/${clientId}/workspace`);

export const addClient = async (
  userId: number,
  clientData: ClientMutationBody
) => await api.post<AddClientResponse>(`/api/${userId}/clients`, clientData);

export const updateClient = async (
  userId: number,
  clientData: ClientMutationBody
) =>
  await api.put<UpdateClientResponse>(
    `/api/${userId}/clients/${clientData.id}`,
    clientData
  );

export const archiveClient = async (userId: number, clientId: number) =>
  await api.delete<ArchiveClientResponse>(`/api/${userId}/clients/${clientId}`);
