import type { Instrumentation } from 'next';

type OnRequestErrorParams = Parameters<Instrumentation.onRequestError>;

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
