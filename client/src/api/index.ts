import {
  AddBankingInformationResp,
  AddClientResp,
  AddInvoiceResp,
  CancelStripeSubscriptionResp,
  CreateCustomerResp,
  CreateNewPasswordResp,
  CreateSubscriptionResp,
  DeleteClientResp,
  DeleteInvoiceResp,
  DeleteUserAccountResp,
  GetBankAccountResp,
  GetBankingInformationEntriesResp,
  GetClientsResp,
  GetInvoiceResp,
  GetInvoicesResp,
  GetInvoicesRevenueResp,
  GetInvoicesTotalAmountResp,
  GetLatestInvoicesResp,
  GetStripeCustomerIdResp,
  GetUserResetPasswordTokenResp,
  PostContactMessageResp,
  RegisterUserResponse,
  ResetPasswordResp,
  SendInvoiceEmailResp,
  UpdateBankingInformationResp,
  UpdateClientResp,
  UpdateInvoiceResp,
  UpdateInvoiceStatusResp,
  UpdateUserAccountSettingsResp,
  UpdateUserResp
} from '@/lib/types/response';
import {
  BankingInformationFormModel,
  UserModel
} from '@/lib/types/models/user';
import { ClientFormData, ClientModel } from '@/lib/types/models/client';
import { InvoiceFormData, InvoiceModel } from '@/lib/types/models/invoice';

import api from './api-instance';

type UserModelWithPassword = UserModel & { password: string };

export const registerUser = async ({
  email,
  password,
  confirmedPassword
}: Pick<UserModelWithPassword, 'email' | 'password'> & {
  confirmedPassword: string;
}) =>
  await api.post<RegisterUserResponse>('/api/users', {
    email,
    password,
    confirmedPassword
  });

// Invoices
export const getInvoice = async (userId: number, invoiceId: number) =>
  await api.get<GetInvoiceResp>(`/api/${userId}/invoices/${invoiceId}`);

export const getInvoices = async (userId: number) =>
  await api.get<GetInvoicesResp>(`/api/${userId}/invoices`);

export const getInvoicesTotalAmount = async (userId: number) =>
  await api.get<GetInvoicesTotalAmountResp>(
    `/api/${userId}/invoices/total-amount`
  );

export const getInvoicesRevenue = async (userId: number) =>
  await api.get<GetInvoicesRevenueResp>(`/api/${userId}/invoices/revenue`);

export const getLatestInvoices = async (userId: number) =>
  await api.get<GetLatestInvoicesResp>(`/api/${userId}/invoices/latest`);

export const addInvoice = async (
  userId: number,
  invoiceData: InvoiceFormData,
  language: string = 'EN'
) => {
  const isSignatureFile = typeof invoiceData.senderSignature !== 'string';

  return await api.post<AddInvoiceResp>(
    `/api/${userId}/invoices`,
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

export const updateInvoice = async (
  userId: number,
  invoiceData: InvoiceModel,
  language: string = 'en'
) => {
  const isSignatureFile = typeof invoiceData.senderSignature !== 'string';

  return await api.put<UpdateInvoiceResp>(
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

export const updateInvoiceStatus = async ({
  userId,
  invoiceId,
  newStatus
}: {
  userId: number;
  invoiceId: number;
  newStatus: 'paid' | 'pending' | 'canceled';
}) =>
  api.put<UpdateInvoiceStatusResp>(
    `/api/${userId}/invoices/${invoiceId}/status`,
    { status: newStatus }
  );

export const deleteInvoice = async (userId: number, invoiceId: number) =>
  await api.delete<DeleteInvoiceResp>(`/api/${userId}/invoices/${invoiceId}`);

export const sendInvoiceEmail = async ({
  id,
  userId,
  invoiceId,
  recipientEmail,
  subject,
  message,
  blob
}: {
  id: number;
  userId: number;
  invoiceId: string;
  recipientEmail: string;
  subject: string;
  message?: string;
  blob: Blob | null;
}) => {
  const formData = new FormData();
  formData.append('recipientEmail', recipientEmail);
  formData.append('subject', subject);
  if (message) {
    formData.append('message', message);
  }
  if (blob) {
    formData.append(
      'pdfAttachment',
      new File([blob], `${invoiceId}.pdf`, { type: 'application/pdf' })
    );
  }

  return await api.post<SendInvoiceEmailResp>(
    `/api/${userId}/invoices/${id}/send-email`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
};

// Clients
export const getClients = async (userId: number) =>
  await api.get<GetClientsResp>(`/api/${userId}/clients`);

export const addClient = async (userId: number, clientData: ClientFormData) =>
  await api.post<AddClientResp>(`/api/${userId}/clients`, clientData);

export const updateClient = async (userId: number, clientData: ClientModel) =>
  await api.put<UpdateClientResp>(
    `/api/${userId}/clients/${clientData.id}`,
    clientData
  );

export const deleteClient = async (userId: number, clientId: number) =>
  await api.delete<DeleteClientResp>(`/api/${userId}/clients/${clientId}`);

export const updateUser = async (id: number, userData: UserModel) => {
  const isSignatureFile = typeof userData.signature !== 'string';

  return await api.put<UpdateUserResp>(`/api/users/${id}`, userData, {
    headers: {
      'Content-Type': isSignatureFile
        ? 'multipart/form-data'
        : 'application/json',
      'Accept-Language': userData.language.toLowerCase()
    }
  });
};

export const getUser = async (id: number) =>
  await api.get<UserModel>(`/api/users/${id}`);

export const loginUser = async (email: string, password: string) =>
  await api.post<UserModelWithPassword>('/api/users/login', {
    email,
    password
  });

export const getBankAccount = async (userId: number, bankAccountId: number) =>
  await api.get<GetBankAccountResp>(
    `/api/${userId}/banking-information/${bankAccountId}`
  );

export const getBankingInformationEntries = async (userId: number) =>
  await api.get<GetBankingInformationEntriesResp>(
    `/api/${userId}/banking-information`
  );

export const addBankingInformation = async (
  userId: number,
  bankingInformation: BankingInformationFormModel,
  hasSelectedBankAccount: boolean
) =>
  await api.post<AddBankingInformationResp>(
    `/api/${userId}/banking-information`,
    {
      ...bankingInformation,
      hasSelectedBankAccount
    }
  );

export const updateBankingInformation = async (
  userId: number,
  bankingInformation: BankingInformationFormModel
) =>
  await api.put<UpdateBankingInformationResp>(
    `/api/${userId}/banking-information/${bankingInformation.id}`,
    {
      ...bankingInformation
    }
  );

export const deleteBankingInformation = async (
  userId: number,
  bankAccountId: number
) => await api.delete(`/api/${userId}/banking-information/${bankAccountId}`);

export const updateUserSelectedBankAccount = async (
  userId: number,
  selectedBankAccountId: number
) =>
  await api.put<UpdateUserResp>(`/api/users/${userId}/selected-bank-account`, {
    selectedBankAccountId
  });

export const updateUserProfilePicture = async (
  userId: number,
  formData: FormData
) =>
  await api.put<UpdateUserResp>(
    `/api/users/${userId}/profile-picture`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
  );

export const updateUserAccountSettings = async (
  userId: number,
  { language, currency }: { language: string; currency: string }
) =>
  await api.put<UpdateUserAccountSettingsResp>(
    `/api/users/${userId}/account-settings`,
    {
      language,
      currency
    },
    { headers: { 'Accept-Language': language.toLowerCase() } }
  );

export const deleteUserAccount = async (userId: number) =>
  await api.delete<DeleteUserAccountResp>(`/api/users/${userId}`);

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
}) =>
  await api.put<UpdateUserResp>(
    `/api/users/${userId}/change-password`,
    { password, newPassword, confirmedNewPassword },
    { headers: { 'Accept-Language': language.toLowerCase() } }
  );

export const resetUserPassword = async ({ email }: { email: string }) =>
  await api.post<ResetPasswordResp>(`/api/forgot-password`, { email });

export const getUserResetPasswordToken = async (token: string) =>
  await api.get<GetUserResetPasswordTokenResp>(
    `/api/reset-password-token/${token}`
  );

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
  await api.put<CreateNewPasswordResp>(
    `/api/users/${userId}/create-new-password`,
    {
      newPassword,
      confirmedNewPassword,
      token
    }
  );

// Stripe
export const createCustomer = async ({
  userId,
  email,
  name
}: {
  userId: number;
  email: string;
  name: string;
}) =>
  await api.post<CreateCustomerResp>(`/api/${userId}/create-customer`, {
    email,
    name
  });

export const createSubscription = async (userId: number, customerId: string) =>
  await api.post<CreateSubscriptionResp>(`/api/${userId}/create-subscription`, {
    customerId
  });

export const getStripeCustomerId = async (userId: number) =>
  await api.get<GetStripeCustomerIdResp>(`/api/${userId}/customer`);

export const cancelStripeSubscription = async (userId: number) =>
  await api.put<CancelStripeSubscriptionResp>(
    `/api/${userId}/cancel-subscription`
  );

// Contact
export const postContactMessage = async ({
  email,
  message
}: {
  email: string;
  message: string;
}) =>
  await api.post<PostContactMessageResp>('/api/contact', {
    email,
    message
  });
