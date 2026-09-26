import { afterEach, describe, expect, it, vi } from 'vitest';

describe('API rate limit configuration', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it.each([undefined, '', '0', '-1', 'NaN', '1.5'])(
    'keeps the default for %s',
    async (value) => {
      vi.stubEnv('API_RATE_LIMIT_MAX', value);
      const { rateLimitPluginOptions } = await import('../rate-limit');
      expect(rateLimitPluginOptions.max).toBe(60);
    }
  );

  it('allows the isolated runner to configure its request budget', async () => {
    vi.stubEnv('API_RATE_LIMIT_MAX', '1000');
    const { rateLimitPluginOptions } = await import('../rate-limit');
    expect(rateLimitPluginOptions.max).toBe(1000);
  });
});
