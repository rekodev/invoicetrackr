import { describe, expect, it } from 'vitest';

import { getRequestErrorProperties, redactRequestError } from '../request-error';

describe('request error utils', () => {
  it('redacts email addresses from the reported message and stack', () => {
    const error = new TypeError('No client for jonas@example.com');

    const redacted = redactRequestError(error);

    expect(redacted).toBeInstanceOf(Error);
    expect(redacted.name).toBe('TypeError');
    expect(redacted.message).toBe('No client for [email]');
    expect(redacted.stack).not.toContain('jonas@example.com');
    expect(redactRequestError('secret jonas@example.com').message).toBe(
      'Non-Error value thrown'
    );
  });

  it('reports the route pattern and digest without the request path or headers', () => {
    const error = Object.assign(new Error('Boom'), { digest: '12345' });

    const properties = getRequestErrorProperties(
      error,
      {
        path: '/lt/invoices/42?email=jonas@example.com',
        method: 'POST',
        headers: { cookie: 'session=secret' }
      },
      {
        routerKind: 'App Router',
        routePath: '/[locale]/invoices/[id]',
        routeType: 'action',
        renderSource: 'react-server-components',
        revalidateReason: undefined
      }
    );

    expect(properties).toEqual({
      source: 'nextServer',
      method: 'POST',
      route: '/[locale]/invoices/[id]',
      routeType: 'action',
      renderSource: 'react-server-components',
      routerKind: 'App Router',
      digest: '12345'
    });
    expect(JSON.stringify(properties)).not.toMatch(/42|example\.com|secret/);
  });

  it('leaves the digest empty when the error has none', () => {
    expect(
      getRequestErrorProperties(
        'plain failure',
        { path: '/en/dashboard', method: 'GET', headers: {} },
        {
          routerKind: 'App Router',
          routePath: '/[locale]/dashboard',
          routeType: 'render',
          revalidateReason: undefined
        }
      ).digest
    ).toBeUndefined();
  });
});
