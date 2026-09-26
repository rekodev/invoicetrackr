import fastifyCookie from '@fastify/cookie';
import fastifyRateLimit from '@fastify/rate-limit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { searchCompanyLookupsOptions } from '../../options/company-lookup';
import { vmiCompanyLookupProvider } from '../../services/company-lookup/vmi';
import { createTestApp, mockAuthMiddleware } from '../../test/app';

vi.mock('../../services/company-lookup/vmi', () => ({
  vmiCompanyLookupProvider: { search: vi.fn() }
}));

const result = {
  companyCode: '123456789',
  legalName: 'Ąžuolas UAB',
  vatNumber: 'LT100001234567',
  registeredAddress: null,
  source: {
    provider: 'vmi' as const,
    label: 'VMI open data via data.gov.lt — CC BY 4.0' as const,
    url: 'https://data.gov.lt/datasets/607/?resource_version=940' as const
  }
};

describe('Company lookup controller', () => {
  beforeEach(() => {
    vi.mocked(vmiCompanyLookupProvider.search).mockResolvedValue([result]);
  });

  it('requires authentication', async () => {
    const app = await createTestApp((fastifyApp) => {
      fastifyApp.register(fastifyCookie);
      fastifyApp.post(
        '/api/:userId/company-lookups/search',
        searchCompanyLookupsOptions
      );
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/1/company-lookups/search',
      payload: { query: 'ąžuolas' }
    });

    expect(response.statusCode).toBe(401);
    expect(vmiCompanyLookupProvider.search).not.toHaveBeenCalled();
    await app.close();
  });

  it.each(['ab', 'x'.repeat(101), '   '])(
    'rejects invalid query %s',
    async (query) => {
      const app = await createTestApp((fastifyApp) => {
        fastifyApp.post('/api/:userId/company-lookups/search', {
          ...searchCompanyLookupsOptions,
          preHandler: mockAuthMiddleware
        });
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/1/company-lookups/search',
        payload: { query }
      });

      expect(response.statusCode).toBe(400);
      expect(vmiCompanyLookupProvider.search).not.toHaveBeenCalled();
      await app.close();
    }
  );

  it('returns normalized results and strips unknown provider fields', async () => {
    vi.mocked(vmiCompanyLookupProvider.search).mockResolvedValue([
      { ...result, upstreamPayload: 'private' } as typeof result
    ]);
    const app = await createTestApp((fastifyApp) => {
      fastifyApp.post('/api/:userId/company-lookups/search', {
        ...searchCompanyLookupsOptions,
        preHandler: mockAuthMiddleware
      });
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/1/company-lookups/search',
      payload: { query: '  ąžuolas  ' }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ results: [result] });
    expect(vmiCompanyLookupProvider.search).toHaveBeenCalledWith('ąžuolas');
    await app.close();
  });

  it('returns a generic error without upstream details', async () => {
    vi.mocked(vmiCompanyLookupProvider.search).mockRejectedValue(
      new Error('upstream payload leaked')
    );
    const app = await createTestApp((fastifyApp) => {
      fastifyApp.post('/api/:userId/company-lookups/search', {
        ...searchCompanyLookupsOptions,
        preHandler: mockAuthMiddleware
      });
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/1/company-lookups/search',
      payload: { query: 'ąžuolas' }
    });

    expect(response.statusCode).toBe(500);
    expect(response.body).not.toContain('upstream payload leaked');
    await app.close();
  });

  it('limits the endpoint to twenty requests per minute', async () => {
    const app = await createTestApp((fastifyApp) => {
      fastifyApp.register(async (rateLimitedApp) => {
        await rateLimitedApp.register(fastifyRateLimit, { global: false });
        rateLimitedApp.post('/api/:userId/company-lookups/search', {
          ...searchCompanyLookupsOptions,
          preHandler: mockAuthMiddleware
        });
      });
    });

    for (let request = 0; request < 20; request += 1) {
      const response = await app.inject({
        method: 'POST',
        url: '/api/1/company-lookups/search',
        payload: { query: 'ąžuolas' }
      });
      expect(response.statusCode).toBe(200);
    }

    const throttled = await app.inject({
      method: 'POST',
      url: '/api/1/company-lookups/search',
      payload: { query: 'ąžuolas' }
    });
    expect(throttled.statusCode).toBe(429);
    await app.close();
  });
});
