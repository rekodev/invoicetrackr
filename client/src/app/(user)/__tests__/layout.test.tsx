import { beforeEach, describe, expect, it, vi } from 'vitest';

import UserLayout from '../layout';

const { auth, getUser, redirect } = vi.hoisted(() => ({
  auth: vi.fn(),
  getUser: vi.fn(),
  redirect: vi.fn(() => {
    throw new Error('redirect');
  })
}));

vi.mock('@/auth', () => ({ auth }));
vi.mock('@/api/user', () => ({ getUser }));
vi.mock('next/navigation', () => ({ redirect }));
vi.mock('@/components/layout/authenticated-shell', () => ({
  default: () => null
}));
vi.mock('../../loading', () => ({ default: () => null }));

describe('authenticated layout recovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.mockResolvedValue({ user: { id: '18' } });
  });

  it.each([401, 429, 500, 503])(
    'shows an error instead of looping through login on API status %s',
    async (status) => {
      getUser.mockResolvedValue({
        status,
        data: { errors: [], message: 'Unavailable' }
      });
      await expect(UserLayout({ children: null })).rejects.toThrow(
        'Failed to load account'
      );
      expect(redirect).not.toHaveBeenCalled();
    }
  );

  it('still sends visitors without a session to login', async () => {
    auth.mockResolvedValue(null);
    await expect(UserLayout({ children: null })).rejects.toThrow('redirect');
    expect(redirect).toHaveBeenCalledWith('/login');
    expect(getUser).not.toHaveBeenCalled();
  });
});
