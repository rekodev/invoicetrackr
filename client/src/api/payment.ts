import {
  CancelStripeSubscriptionResponse,
  CreateCustomerResponse,
  CreateSubscriptionResponse,
  GetStripeCustomerIdResponse
} from '@invoicetrackr/types';

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
  await api.post<CreateCustomerResponse>(`/api/${userId}/create-customer`, {
    email,
    name
  });

export const createSubscription = async (userId: number, customerId: string) =>
  await api.post<CreateSubscriptionResponse>(
    `/api/${userId}/create-subscription`,
    {
      customerId
    }
  );

export const getStripeCustomerId = async (userId: number) =>
  await api.get<GetStripeCustomerIdResponse>(`/api/${userId}/customer`);

export const cancelStripeSubscription = async (userId: number) =>
  await api.put<CancelStripeSubscriptionResponse>(
    `/api/${userId}/cancel-subscription`
  );
