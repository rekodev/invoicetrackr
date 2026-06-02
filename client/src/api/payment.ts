import {
  BillingStatusResponse,
  BillingUrlResponse
} from '@invoicetrackr/types';

import api from './api-instance';

export const getBillingStatus = async (userId: number) =>
  await api.get<BillingStatusResponse>(`/api/${userId}/billing`);

export const startTrial = async (userId: number) =>
  await api.post<BillingStatusResponse>(`/api/${userId}/billing/start-trial`);

export const createBillingPortalSession = async (userId: number) =>
  await api.post<BillingUrlResponse>(`/api/${userId}/billing/portal-session`);

export const createCheckoutSession = async (userId: number) =>
  await api.post<BillingUrlResponse>(`/api/${userId}/billing/checkout-session`);

export const resumeSubscription = async (userId: number) =>
  await api.post<BillingStatusResponse>(`/api/${userId}/billing/resume`);
