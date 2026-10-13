import type { SendRecipientDetailsRequestBody } from '@invoicetrackr/types';
import { createHash, timingSafeEqual } from 'crypto';
import { FastifyRequest } from 'fastify';
import { useI18n } from 'fastify-i18n';

import { loadEnv } from '../config/env';
import {
  getUserEmailVerificationStatusFromDb,
  userExistsInDb
} from '../database/user';
import { ForbiddenError, UnauthorizedError } from '../utils/error';
import { decodeSessionToken } from '../utils/session';

loadEnv();

export const INTERNAL_API_SECRET_HEADER = 'x-internal-api-secret';

const digest = (value: string) => createHash('sha256').update(value).digest();

export const authMiddleware = async (
  req: FastifyRequest<{ Params: { userId?: string; email?: string } }>
) => {
  const decodedToken = await decodeSessionToken(req);

  if (!decodedToken || decodedToken.sub !== req.params.userId) {
    throw new UnauthorizedError();
  }

  if (!(await userExistsInDb(Number(decodedToken.sub)))) {
    throw new UnauthorizedError();
  }
};

export const requireVerifiedEmail = async (
  req: FastifyRequest<{ Params: { userId?: string } }>
) => {
  const i18n = await useI18n(req);
  const userId = Number(req.params.userId);

  if (!userId) throw new UnauthorizedError();

  const user = await getUserEmailVerificationStatusFromDb(userId);

  if (!user?.emailVerifiedAt) {
    throw new ForbiddenError(i18n.t('error.user.emailVerificationRequired'));
  }
};

export const requireVerifiedEmailWhenSending = async (
  req: FastifyRequest<{
    Params: { userId?: string };
    Body: SendRecipientDetailsRequestBody;
  }>
) => {
  if (!req.body.sendEmail) return;

  await requireVerifiedEmail(req);
};

export const requireInternalApiSecret = async (req: FastifyRequest) => {
  const expected = process.env.INTERNAL_API_SECRET;
  const provided = req.headers[INTERNAL_API_SECRET_HEADER];

  if (
    !expected ||
    typeof provided !== 'string' ||
    !timingSafeEqual(digest(provided), digest(expected))
  ) {
    throw new UnauthorizedError();
  }
};
