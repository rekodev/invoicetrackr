import { describe, expect, it, vi } from 'vitest';

import { pingDb } from '../../database/db';
import { getHealthOptions } from '../../options/health';
import { createTestApp } from '../../test/app';

vi.mock('../../database/db', () => ({ pingDb: vi.fn() }));

describe('Health Controller', () => {
  it('reports ok while the database answers and 503 once it does not', async () => {
    const app = await createTestApp((fastifyApp) => {
      fastifyApp.get('/api/health', getHealthOptions);
    });

    vi.mocked(pingDb).mockResolvedValueOnce();
    const healthy = await app.inject({ method: 'GET', url: '/api/health' });

    expect(healthy.statusCode).toBe(200);
    expect(healthy.json()).toEqual({ status: 'ok' });

    vi.mocked(pingDb).mockRejectedValueOnce(new Error('connection refused'));
    const unhealthy = await app.inject({ method: 'GET', url: '/api/health' });

    expect(unhealthy.statusCode).toBe(503);
    expect(unhealthy.json()).toEqual({ status: 'unavailable' });

    await app.close();
  });
});
