import type { Instrumentation } from 'next';

type OnRequestErrorParams = Parameters<Instrumentation.onRequestError>;

const EMAIL_PATTERN = /[^\s@"'<>()]+@[^\s@"'<>()]+\.[^\s@"'<>()]+/g;

const redactText = (text: string) => text.replace(EMAIL_PATTERN, '[email]');

export const redactRequestError = (error: unknown) => {
  if (!(error instanceof Error)) return new Error('Non-Error value thrown');

  const redacted = new Error(redactText(error.message));
  redacted.name = error.name;
  redacted.stack = error.stack && redactText(error.stack);

  return redacted;
};

export const getRequestErrorProperties = (
  error: OnRequestErrorParams[0],
  request: OnRequestErrorParams[1],
  context: OnRequestErrorParams[2]
) => ({
  source: 'nextServer',
  method: request.method,
  route: context.routePath,
  routeType: context.routeType,
  renderSource: context.renderSource,
  routerKind: context.routerKind,
  digest:
    error && typeof error === 'object' && 'digest' in error
      ? String(error.digest)
      : undefined
});
