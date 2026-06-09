import {
  BillingStatusResponse,
  BillingUrlResponse,
  ConsumePaymentSuccessResponse
} from '@invoicetrackr/types';
import type { BillingInterval } from '@invoicetrackr/types';

import api from './api-instance';

export const getBillingStatus = async (userId: number) =>
  await api.get<BillingStatusResponse>(`/api/${userId}/billing`);

export const startTrial = async (userId: number, interval: BillingInterval) =>
  await api.post<BillingStatusResponse>(`/api/${userId}/billing/start-trial`, {
    interval
  });

export const createBillingPortalSession = async (userId: number) =>
  await api.post<BillingUrlResponse>(`/api/${userId}/billing/portal-session`);

export const createCheckoutSession = async (
  userId: number,
  interval: BillingInterval
) =>
  await api.post<BillingUrlResponse>(
    `/api/${userId}/billing/checkout-session`,
    { interval }
  );

export const resumeSubscription = async (userId: number) =>
  await api.post<BillingStatusResponse>(`/api/${userId}/billing/resume`);

export const consumePaymentSuccess = async ({
  userId,
  trial,
  sessionId
}: {
  userId: number;
  trial: boolean;
  sessionId?: string;
}) =>
  await api.post<ConsumePaymentSuccessResponse>(
    `/api/${userId}/billing/consume-payment-success`,
    { trial, sessionId }
  );
