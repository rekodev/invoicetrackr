import type { Instrumentation } from 'next';

import {
  getRequestErrorProperties,
  redactRequestError
} from '@/lib/utils/request-error';

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context
) => {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const { captureWebServerException } = await import(
    '@/lib/analytics/server-errors'
  );

  captureWebServerException(
    redactRequestError(error),
    getRequestErrorProperties(error, request, context)
  );
};
