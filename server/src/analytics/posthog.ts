import { PostHog } from 'posthog-node';

import { getUserFromDb } from '../database/user';
import type { AnalyticsEvent, AnalyticsProperties } from './events';

let posthog: PostHog | undefined;

const getPostHog = () => {
  if (process.env.NODE_ENV === 'test') return undefined;

  const key = process.env.POSTHOG_KEY;
  if (!key) return undefined;

  if (!posthog) {
    posthog = new PostHog(key, {
      host: process.env.POSTHOG_HOST || 'https://eu.i.posthog.com'
    });
  }

  return posthog;
};

export const captureAnalyticsEventForUser = async ({
  userId,
  event,
  properties
}: {
  userId: number;
  event: AnalyticsEvent;
  properties?: AnalyticsProperties;
}) => {
  const client = getPostHog();
  if (!client) return;

  try {
    const user = await getUserFromDb(userId);
    if (user?.analyticsConsentStatus !== 'accepted') return;

    client.capture({
      distinctId: `user:${userId}`,
      event,
      properties
    });
  } catch (error) {
    console.error(
      { error, event, userId },
      'Unable to capture analytics event'
    );
  }
};
