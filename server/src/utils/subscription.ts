import { StripeSubscriptionStatus } from '@invoicetrackr/types';

export const hasActiveSubscription = (
  subscriptionStatus: StripeSubscriptionStatus | null | undefined
): boolean => {
  if (!subscriptionStatus) return false;

  return subscriptionStatus === 'active' || subscriptionStatus === 'trialing';
};

export const isSubscriptionPastDue = (
  subscriptionStatus: StripeSubscriptionStatus | null | undefined
): boolean => {
  return subscriptionStatus === 'past_due';
};

export const isSubscriptionCanceled = (
  subscriptionStatus: StripeSubscriptionStatus | null | undefined
): boolean => {
  if (!subscriptionStatus) return true;

  const canceledStatuses: Array<StripeSubscriptionStatus> = [
    'canceled',
    'incomplete_expired',
    'unpaid'
  ];

  return canceledStatuses.includes(subscriptionStatus);
};
