import { beforeEach, describe, expect, it, vi } from 'vitest';

import RateLimitNotice from '@/components/ui/rate-limit-notice';

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
vi.mock('@/components/ui/rate-limit-notice', () => ({ default: () => null }));
vi.mock('../../loading', () => ({ default: () => null }));

describe('authenticated layout recovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.mockResolvedValue({
      user: {
        id: '18',
        name: 'Rūta',
        email: 'ruta@example.com',
        image: null,
        language: 'lt'
      }
    });
  });

  it.each([401, 500, 503])(
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

  it('keeps the signed-in shell and shows a rate-limit notice on 429', async () => {
    getUser.mockResolvedValue({
      status: 429,
      data: { errors: [], message: 'Too many requests', code: 'RATE_LIMITED' }
    });

    const shell = await UserLayout({ children: 'page content' });

    expect(shell.props.user).toEqual({
      id: 18,
      name: 'Rūta',
      email: 'ruta@example.com',
      profilePictureUrl: '',
      language: 'lt'
    });
    expect(shell.props.children.props.children.type).toBe(RateLimitNotice);
    expect(redirect).not.toHaveBeenCalled();
  });

  it('still sends visitors without a session to login', async () => {
    auth.mockResolvedValue(null);
    await expect(UserLayout({ children: null })).rejects.toThrow('redirect');
    expect(redirect).toHaveBeenCalledWith('/login');
    expect(getUser).not.toHaveBeenCalled();
  });
});
