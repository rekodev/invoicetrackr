import type { SendRecipientDetailsRequestBody } from '@invoicetrackr/types';
import type { FastifyRequest } from 'fastify';
import { describe, expect, it, vi } from 'vitest';

import { getUserEmailVerificationStatusFromDb } from '../../database/user';
import { requireVerifiedEmailWhenSending } from '../auth';

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
