import { getPostHog } from './posthog';

const SERVER_DISTINCT_ID = 'invoicetrackr-server';

type ExceptionContext = {
  method?: string;
  route?: string;
  statusCode?: number;
  source: 'request' | 'unhandledRejection' | 'uncaughtException';
};

export const captureServerException = (
  error: unknown,
  context: ExceptionContext
) => {
  getPostHog()?.captureException(error, SERVER_DISTINCT_ID, context);
};

export const captureServerExceptionImmediate = async (
  error: unknown,
  context: ExceptionContext
) => {
  const client = getPostHog();

  if (!client) return;

  await client.captureExceptionImmediate(error, SERVER_DISTINCT_ID, context);
  await client.shutdown();
};
