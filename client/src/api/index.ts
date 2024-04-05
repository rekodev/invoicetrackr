import { ClientModel } from '@/types/models/client';

import api from './apiInstance';

export const getInvoices = async (userId: number) =>
  await api.get(`/api/${userId}invoices`);

export const postClient = async (
  userId: number,
  clientData: Omit<ClientModel, 'id'>
) => await api.post(`/api/${userId}/clients`, clientData);
