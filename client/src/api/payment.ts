import {
  CancelStripeSubscriptionResp,
  CreateCustomerResp,
  CreateSubscriptionResp,
  GetStripeCustomerIdResp
} from '@/lib/types/response';

import api from './api-instance';

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
