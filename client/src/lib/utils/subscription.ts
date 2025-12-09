import { User } from 'next-auth';

export const hasActiveSubscription = (user: User | undefined): boolean => {
  if (!user?.subscriptionStatus) return false;

  return (
    user.subscriptionStatus === 'active' ||
    user.subscriptionStatus === 'trialing'
  );
};

export const isSubscriptionPastDue = (user: User | undefined): boolean => {
  return user?.subscriptionStatus === 'past_due';
};

export const isSubscriptionCanceled = (user: User | undefined): boolean => {
  if (!user?.subscriptionStatus) return true;

  return ['canceled', 'incomplete_expired', 'unpaid'].includes(
    user.subscriptionStatus
  );
};
