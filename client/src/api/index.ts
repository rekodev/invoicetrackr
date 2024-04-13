import { AxiosResponse } from 'axios';

import { InvoiceFormData } from '@/components/AddNewInvoiceForm';
import { ClientFormData, ClientModel } from '@/types/models/client';
import {
  AddClientResp,
  AddInvoiceResp,
  DeleteClientResp,
  UpdateClientResp,
} from '@/types/response';

import api from './apiInstance';

export const getInvoices = async (userId: number) =>
  await api.get(`/api/${userId}invoices`);

export const addInvoice = async (
  userId: number,
  invoiceData: InvoiceFormData
): Promise<AxiosResponse<AddInvoiceResp>> =>
  await api.post(`/api/${userId}/invoices`, invoiceData);

export const addClient = async (
  userId: number,
  clientData: ClientFormData
): Promise<AxiosResponse<AddClientResp>> =>
  await api.post(`/api/${userId}/clients`, clientData);

export const updateClient = async (
  userId: number,
  clientData: ClientModel
): Promise<AxiosResponse<UpdateClientResp>> =>
  await api.put(`/api/${userId}/clients/${clientData.id}`, clientData);

export const deleteClient = async (
  userId: number,
  clientId: number
): Promise<AxiosResponse<DeleteClientResp>> =>
  await api.delete(`/api/${userId}/clients/${clientId}`);
