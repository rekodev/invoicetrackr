import { PostHog } from 'posthog-node';

const WEB_SERVER_DISTINCT_ID = 'invoicetrackr-web-server';

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

export const captureWebServerException = async (
  error: unknown,
  properties: Record<string, string | undefined>
) => {
  const client = getPostHog();
  if (!client) return;

  try {
    await client.captureExceptionImmediate(
      error,
      WEB_SERVER_DISTINCT_ID,
      properties
    );
  } catch (captureError) {
    console.error('Unable to report server error to PostHog', captureError);
  }
};
