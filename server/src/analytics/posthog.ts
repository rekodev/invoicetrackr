import { PostHog } from 'posthog-node';

import type { AnalyticsEvent, AnalyticsProperties } from './events';
import { getUserFromDb } from '../database/user';

let posthog: PostHog | undefined;

const getPostHog = () => {
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

  const user = await getUserFromDb(userId);
  if (user?.analyticsConsentStatus !== 'accepted') return;

  try {
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
