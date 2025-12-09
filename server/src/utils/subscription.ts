export const hasActiveSubscription = (
  subscriptionStatus: string | null | undefined
): boolean => {
  if (!subscriptionStatus) return false;

  return subscriptionStatus === 'active' || subscriptionStatus === 'trialing';
};

export const isSubscriptionPastDue = (
  subscriptionStatus: string | null | undefined
): boolean => {
  return subscriptionStatus === 'past_due';
};

export const isSubscriptionCanceled = (
  subscriptionStatus: string | null | undefined
): boolean => {
  if (!subscriptionStatus) return true;

  return ['canceled', 'incomplete_expired', 'unpaid'].includes(
    subscriptionStatus
  );
};
