import type { SendRecipientDetailsRequestBody } from '@invoicetrackr/types';
import type { FastifyRequest } from 'fastify';
import { encode } from 'next-auth/jwt';
import { describe, expect, it, vi } from 'vitest';

import {
  getUserEmailVerificationStatusFromDb,
  userExistsInDb
} from '../../database/user';
import { authMiddleware, requireVerifiedEmailWhenSending } from '../auth';

vi.mock('../../database/user');

type RecipientDetailsRequest = FastifyRequest<{
  Params: { userId?: string };
  Body: SendRecipientDetailsRequestBody;
}>;

const request = (sendEmail: boolean) =>
  ({
    body: { sendEmail },
    params: { userId: '1' }
  }) as RecipientDetailsRequest;

describe('requireVerifiedEmailWhenSending', () => {
  it('allows copying a recipient-details link without email verification', async () => {
    await expect(
      requireVerifiedEmailWhenSending(request(false))
    ).resolves.toBeUndefined();
    expect(getUserEmailVerificationStatusFromDb).not.toHaveBeenCalled();
  });

  it('requires email verification before sending a recipient-details email', async () => {
    vi.mocked(getUserEmailVerificationStatusFromDb).mockResolvedValue({
      id: 1,
      email: 'sender@example.com',
      emailVerifiedAt: null,
      language: 'en'
    });

    await expect(
      requireVerifiedEmailWhenSending(request(true))
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(getUserEmailVerificationStatusFromDb).toHaveBeenCalledWith(1);
  });
});

describe('authMiddleware', () => {
  const AUTH_COOKIE = 'authjs.session-token';

  const sessionRequest = async (userId: string) => {
    vi.stubEnv('AUTH_SECRET', 'test-auth-secret');
    const token = await encode({
      token: { sub: userId },
      secret: 'test-auth-secret',
      salt: AUTH_COOKIE
    });

    return {
      cookies: { [AUTH_COOKIE]: token },
      params: { userId }
    } as unknown as FastifyRequest<{ Params: { userId?: string } }>;
  };

  it('rejects a still-valid session token once the account is deleted', async () => {
    const request = await sessionRequest('7');

    vi.mocked(userExistsInDb).mockResolvedValue(true);
    await expect(authMiddleware(request)).resolves.toBeUndefined();

    vi.mocked(userExistsInDb).mockResolvedValue(false);
    await expect(authMiddleware(request)).rejects.toMatchObject({
      statusCode: 401
    });
    expect(userExistsInDb).toHaveBeenCalledWith(7);
  });
});
