import fastifyCookie from '@fastify/cookie';
import fastifyRateLimit from '@fastify/rate-limit';
import fastify from 'fastify';
import { encode } from 'next-auth/jwt';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mockLocalizedI18n } from '../../test/i18n';
import { errorHandler } from '../error';

const AUTH_COOKIE = 'authjs.session-token';

const loadRateLimit = () => import('../rate-limit');

const createApp = async () => {
  const { ipRateLimit, rateLimitPluginOptions, rateLimitKey, trustedProxies } =
    await loadRateLimit();
  const app = fastify({ logger: false, trustProxy: trustedProxies });

  app.register(fastifyCookie);
  app.register(fastifyRateLimit, rateLimitPluginOptions);
  app.setErrorHandler(errorHandler);
  app.register(async (routes) => {
    routes.get('/key', async (request) => ({
      key: await rateLimitKey(request)
    }));
    routes.post(
      '/strict',
      { config: { rateLimit: ipRateLimit(1, '1 minute') } },
      async () => ({ ok: true })
    );
  });
  await app.ready();

  return app;
};

describe('API rate limiting', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it.each([undefined, '', '0', '-1', 'NaN', '1.5'])(
    'keeps the default anonymous budget for %s',
    async (value) => {
      vi.stubEnv('API_RATE_LIMIT_MAX', value);
      const limits = await loadRateLimit();
      expect(limits.ANONYMOUS_RATE_LIMIT_MAX).toBe(60);
      expect(limits.AUTHENTICATED_RATE_LIMIT_MAX).toBe(300);
    }
  );

  it('allows the isolated runner to raise both budgets', async () => {
    vi.stubEnv('API_RATE_LIMIT_MAX', '1000');
    const { rateLimitPluginOptions } = await loadRateLimit();

    expect(rateLimitPluginOptions.max({} as never, 'ip:1.2.3.4')).toBe(1000);
    expect(rateLimitPluginOptions.max({} as never, 'user:1')).toBe(1000);
  });

  it('keys signed-in users by account and visitors by the real client IP', async () => {
    vi.stubEnv('AUTH_SECRET', 'test-auth-secret');
    const app = await createApp();
    const token = await encode({
      token: { sub: '7' },
      secret: 'test-auth-secret',
      salt: AUTH_COOKIE
    });
    const keyFor = async (
      remoteAddress: string,
      headers: Record<string, string> = {}
    ) =>
      (
        await app.inject({ method: 'GET', url: '/key', remoteAddress, headers })
      ).json().key;

    expect(
      await keyFor('127.0.0.1', { cookie: `${AUTH_COOKIE}=${token}` })
    ).toBe('user:7');
    expect(
      await keyFor('127.0.0.1', { cookie: `${AUTH_COOKIE}=not-a-token` })
    ).toBe('ip:127.0.0.1');
    // Next proxy (loopback) -> nginx (Docker network) -> visitor; the forged first entry is ignored.
    expect(
      await keyFor('127.0.0.1', {
        'x-forwarded-for': '6.6.6.6, 203.0.113.7, 172.17.0.1'
      })
    ).toBe('ip:203.0.113.7');
    expect(await keyFor('198.51.100.9', { 'x-forwarded-for': '6.6.6.6' })).toBe(
      'ip:198.51.100.9'
    );

    await app.close();
  });

  it('answers an exceeded limit with a localized 429 and Retry-After', async () => {
    mockLocalizedI18n();
    const app = await createApp();
    const send = () =>
      app.inject({
        method: 'POST',
        url: '/strict',
        remoteAddress: '203.0.113.7',
        headers: { 'accept-language': 'lt' }
      });

    expect((await send()).statusCode).toBe(200);
    const response = await send();

    expect(response.statusCode).toBe(429);
    expect(response.headers['retry-after']).toBe('60');
    expect(response.json()).toEqual({
      errors: [],
      code: 'RATE_LIMITED',
      message: 'Per daug užklausų. Palaukite 60 sek. ir bandykite dar kartą.'
    });

    await app.close();
  });
});
