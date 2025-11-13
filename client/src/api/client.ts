import {
  AddClientResp,
  DeleteClientResp,
  GetClientsResp,
  UpdateClientResp
} from '@/lib/types/response/client';
import { ClientFormData } from '@/lib/types/models';
import { Client } from '@invoicetrackr/types';

import api from './api-instance';

export const getClients = async (userId: number) =>
  await api.get<GetClientsResp>(`/api/${userId}/clients`);

export const addClient = async (userId: number, clientData: ClientFormData) =>
  await api.post<AddClientResp>(`/api/${userId}/clients`, clientData);

export const updateClient = async (userId: number, clientData: Client) =>
  await api.put<UpdateClientResp>(
    `/api/${userId}/clients/${clientData.id}`,
    clientData
  );

export const deleteClient = async (userId: number, clientId: number) =>
  await api.delete<DeleteClientResp>(`/api/${userId}/clients/${clientId}`);
