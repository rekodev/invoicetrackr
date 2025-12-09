import 'server-only';

import { getUser } from '@/api/user';

import { isResponseError } from './error';
import { updateSessionAction } from '../actions';

/**
 * Syncs the user's subscription status from the database to the session
 * Call this in layouts or pages where subscription status is critical
 */
export async function syncSubscriptionStatus(userId: string) {
  try {
    const response = await getUser(Number(userId));

    if (isResponseError(response)) {
      console.error('Failed to fetch user for sync:', response);
      return null;
    }

    const dbSubscriptionStatus = response.data.user.subscriptionStatus;

    // Update the session with fresh data from DB
    await updateSessionAction({
      newSession: { subscriptionStatus: dbSubscriptionStatus }
    });

    return dbSubscriptionStatus;
  } catch (error) {
    console.error('Error syncing subscription status:', error);
    return null;
  }
}
