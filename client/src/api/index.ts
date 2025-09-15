import { AxiosResponse } from 'axios';

import { ClientFormData, ClientModel } from '@/lib/types/models/client';
import { InvoiceFormData, InvoiceModel } from '@/lib/types/models/invoice';
import {
  BankingInformationFormModel,
  UserModel
} from '@/lib/types/models/user';
import {
  AddBankingInformationResp,
  AddClientResp,
  AddInvoiceResp,
  CancelStripeSubscriptionResp,
  CreateCustomerResp,
  CreateSubscriptionResp,
  DeleteClientResp,
  DeleteInvoiceResp,
  DeleteUserAccountResp,
  GetBankAccountResp,
  GetBankingInformationResp,
  GetClientsResp,
  GetInvoiceResp,
  GetInvoicesResp,
  GetInvoicesRevenueResp,
  GetInvoicesTotalAmountResp,
  GetLatestInvoicesResp,
  GetStripeCustomerIdResp,
  GetUserResetPasswordTokenResp,
  RegisterUserResponse,
  ResetPasswordResp,
  UpdateClientResp,
  UpdateInvoiceResp,
  UpdateUserAccountSettingsResp,
  UpdateUserResp
} from '@/lib/types/response';

import api, { ApiError } from './api-instance';

type UserModelWithPassword = UserModel & { password: string };

export const registerUser = async ({
  email,
  password,
  confirmedPassword
}: Pick<UserModelWithPassword, 'email' | 'password'> & {
  confirmedPassword: string;
}): Promise<AxiosResponse<RegisterUserResponse>> =>
  await api.post('/api/users', { email, password, confirmedPassword });

export const getInvoice = async (
  userId: number,
  invoiceId: number
): Promise<AxiosResponse<GetInvoiceResp>> =>
  await api.get(`/api/${userId}/invoices/${invoiceId}`);

export const getInvoices = async (
  userId: number
): Promise<AxiosResponse<GetInvoicesResp>> =>
  await api.get(`/api/${userId}/invoices`);

export const getInvoicesTotalAmount = async (
  userId: number
): Promise<AxiosResponse<GetInvoicesTotalAmountResp>> =>
  await api.get(`/api/${userId}/invoices/total-amount`);

export const getInvoicesRevenue = async (
  userId: number
): Promise<AxiosResponse<GetInvoicesRevenueResp>> =>
  await api.get(`/api/${userId}/invoices/revenue`);

export const getLatestInvoices = async (
  userId: number
): Promise<AxiosResponse<GetLatestInvoicesResp>> =>
  await api.get(`/api/${userId}/invoices/latest`);

export const addInvoice = async (
  userId: number,
  invoiceData: InvoiceFormData,
  language: string = 'EN'
): Promise<AxiosResponse<AddInvoiceResp>> => {
  const isSignatureFile = typeof invoiceData.senderSignature !== 'string';

  return await api.post(`/api/${userId}/invoices`, invoiceData, {
    headers: {
      'Content-Type': isSignatureFile
        ? 'multipart/form-data'
        : 'application/json',
      'Accept-Language': language.toLowerCase()
    }
  });
};

export const updateInvoice = async (
  userId: number,
  invoiceData: InvoiceModel,
  language: string = 'en'
): Promise<AxiosResponse<UpdateInvoiceResp>> => {
  const isSignatureFile = typeof invoiceData.senderSignature !== 'string';

  return await api.put(
    `/api/${userId}/invoices/${invoiceData.id}`,
    invoiceData,
    {
      headers: {
        'Content-Type': isSignatureFile
          ? 'multipart/form-data'
          : 'application/json',
        'Accept-Language': language.toLowerCase()
      }
    }
  );
};

export const deleteInvoice = async (
  userId: number,
  invoiceId: number
): Promise<AxiosResponse<DeleteInvoiceResp>> =>
  await api.delete(`/api/${userId}/invoices/${invoiceId}`);

// Clients
export const getClients = async (
  userId: number
): Promise<AxiosResponse<GetClientsResp>> =>
  await api.get(`/api/${userId}/clients`);

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
): Promise<AxiosResponse<UpdateUserResp>> => {
  const isSignatureFile = typeof userData.signature !== 'string';

  return await api.put(`/api/users/${id}`, userData, {
    headers: {
      'Content-Type': isSignatureFile
        ? 'multipart/form-data'
        : 'application/json',
      'Accept-Language': userData.language.toLowerCase()
    }
  });
};

export const getUser = async (id: number): Promise<AxiosResponse<UserModel>> =>
  await api.get(`/api/users/${id}`);

export const loginUser = async (
  email: string,
  password: string
): Promise<AxiosResponse<ApiError & { user: UserModelWithPassword }>> =>
  await api.post('/api/users/login', { email, password });

export const getBankAccount = async (
  userId: number,
  bankAccountId: number
): Promise<AxiosResponse<GetBankAccountResp>> =>
  await api.get(`/api/${userId}/banking-information/${bankAccountId}`);

export const getBankingInformation = async (
  userId: number
): Promise<AxiosResponse<GetBankingInformationResp>> =>
  await api.get(`/api/${userId}/banking-information`);

export const addBankingInformation = async (
  userId: number,
  bankingInformation: BankingInformationFormModel,
  hasSelectedBankAccount: boolean
): Promise<AxiosResponse<AddBankingInformationResp>> =>
  await api.post(`/api/${userId}/banking-information`, {
    ...bankingInformation,
    hasSelectedBankAccount
  });

export const deleteBankingInformation = async (
  userId: number,
  bankAccountId: number
) => await api.delete(`/api/${userId}/banking-information/${bankAccountId}`);

export const updateUserSelectedBankAccount = async (
  userId: number,
  selectedBankAccountId: number
): Promise<AxiosResponse<UpdateUserResp>> =>
  await api.put(`/api/users/${userId}/selected-bank-account`, {
    selectedBankAccountId
  });

export const updateUserProfilePicture = async (
  userId: number,
  formData: FormData
): Promise<AxiosResponse<UpdateUserResp>> =>
  await api.put(`/api/users/${userId}/profile-picture`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const updateUserAccountSettings = async (
  userId: number,
  { language, currency }: { language: string; currency: string }
): Promise<AxiosResponse<UpdateUserAccountSettingsResp>> =>
  await api.put(
    `/api/users/${userId}/account-settings`,
    {
      language,
      currency
    },
    { headers: { 'Accept-Language': language.toLowerCase() } }
  );

export const deleteUserAccount = async (
  userId: number
): Promise<AxiosResponse<DeleteUserAccountResp>> =>
  await api.delete(`/api/users/${userId}`);

export const changeUserPassword = async ({
  userId,
  language = 'en',
  password,
  newPassword,
  confirmedNewPassword
}: {
  userId: number;
  language?: string;
  password: string;
  newPassword: string;
  confirmedNewPassword: string;
}): Promise<AxiosResponse<UpdateUserResp>> =>
  await api.put(
    `/api/users/${userId}/change-password`,
    { password, newPassword, confirmedNewPassword },
    { headers: { 'Accept-Language': language.toLowerCase() } }
  );

export const resetUserPassword = async ({
  email
}: {
  email: string;
}): Promise<AxiosResponse<ResetPasswordResp>> =>
  await api.post(`/api/forgot-password`, { email });

export const getUserResetPasswordToken = async (
  token: string
): Promise<AxiosResponse<GetUserResetPasswordTokenResp>> =>
  await api.get(`/api/reset-password-token/${token}`);

export const createNewUserPassword = async ({
  userId,
  newPassword,
  confirmedNewPassword,
  token
}: {
  userId: number;
  newPassword: string;
  confirmedNewPassword: string;
  token: string;
}) =>
  await api.put(`/api/users/${userId}/create-new-password`, {
    newPassword,
    confirmedNewPassword,
    token
  });

// Stripe
export const createCustomer = async ({
  userId,
  email,
  name
}: {
  userId: number;
  email: string;
  name: string;
}): Promise<AxiosResponse<CreateCustomerResp>> =>
  await api.post(`/api/${userId}/create-customer`, {
    email,
    name
  });

export const createSubscription = async (
  userId: number,
  customerId: string
): Promise<AxiosResponse<CreateSubscriptionResp>> =>
  await api.post(`/api/${userId}/create-subscription`, { customerId });

export const getStripeCustomerId = async (
  userId: number
): Promise<AxiosResponse<GetStripeCustomerIdResp>> =>
  await api.get(`/api/${userId}/customer`);

export const cancelStripeSubscription = async (
  userId: number
): Promise<AxiosResponse<CancelStripeSubscriptionResp>> =>
  await api.put(`/api/${userId}/cancel-subscription`);
