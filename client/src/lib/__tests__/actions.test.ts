import { describe, expect, it, vi } from 'vitest';

import { getRequestHeadersAction } from '../actions';

vi.mock('@/api/user', () => ({}));
vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('../../auth', () => ({}));
vi.mock('next-auth', () => ({ AuthError: class extends Error {} }));
vi.mock('next-intl/server', () => ({
  getLocale: async () => 'lt',
  getTranslations: vi.fn()
}));
vi.mock('next/headers', () => ({
  cookies: async () =>
    new Map([['authjs.session-token', { value: 'session-token' }]]),
  headers: async () =>
    new Headers({
      'x-forwarded-for': '203.0.113.7',
      'x-real-ip': '203.0.113.7'
    })
}));

describe('getRequestHeadersAction', () => {
  it('forwards the session, locale and visitor IP to the API', async () => {
    await expect(getRequestHeadersAction()).resolves.toEqual({
      Cookie: 'authjs.session-token=session-token',
      'Accept-Language': 'lt',
      'X-Forwarded-For': '203.0.113.7',
      'X-Real-IP': '203.0.113.7'
    });
  });
});
