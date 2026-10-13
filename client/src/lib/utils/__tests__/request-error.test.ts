import { describe, expect, it } from 'vitest';

import { getRequestErrorProperties } from '../request-error';

describe('request error utils', () => {
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
