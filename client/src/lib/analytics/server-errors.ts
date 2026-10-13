import { PostHog } from 'posthog-node';

import { POSTHOG_DEFAULT_HOST } from './constants';

const WEB_SERVER_DISTINCT_ID = 'invoicetrackr-web-server';

let posthog: PostHog | undefined;

const getPostHog = () => {
  if (process.env.NODE_ENV === 'test') return undefined;

  const key = process.env.POSTHOG_KEY;
  if (!key) return undefined;

  if (!posthog) {
    posthog = new PostHog(key, {
      host: process.env.POSTHOG_HOST || POSTHOG_DEFAULT_HOST,
      flushAt: 1
    });
  }

  return posthog;
};

export const captureWebServerException = (
  error: unknown,
  properties: Record<string, string | undefined>
) => {
  getPostHog()?.captureException(error, WEB_SERVER_DISTINCT_ID, properties);
};
