import { AxiosResponse } from 'axios';

import { ClientFormData, ClientModel } from '@/types/models/client';
import { InvoiceFormData, InvoiceModel } from '@/types/models/invoice';
import { UserModel } from '@/types/models/user';
import {
  AddClientResp,
  AddInvoiceResp,
  DeleteClientResp,
  DeleteInvoiceResp,
  UpdateClientResp,
  UpdateInvoiceResp,
  UpdateUserResp,
} from '@/types/response';

import api from './apiInstance';

export const addInvoice = async (
  userId: number,
  invoiceData: InvoiceFormData
): Promise<AxiosResponse<AddInvoiceResp>> =>
  await api.post(`/api/${userId}/invoices`, invoiceData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateInvoice = async (
  userId: number,
  invoiceData: InvoiceModel
): Promise<AxiosResponse<UpdateInvoiceResp>> =>
  api.put(`/api/${userId}/invoices/${invoiceData.id}`, invoiceData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteInvoice = async (
  userId: number,
  invoiceId: number
): Promise<AxiosResponse<DeleteInvoiceResp>> =>
  await api.delete(`/api/${userId}/invoices/${invoiceId}`);

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

export const updateUser = async (
  id: number,
  userData: UserModel
): Promise<AxiosResponse<UpdateUserResp>> =>
  await api.put(`/api/users/${id}`, userData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
