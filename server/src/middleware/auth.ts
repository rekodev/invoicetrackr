import { FastifyRequest } from 'fastify';
import { useI18n } from 'fastify-i18n';
import { decode } from 'next-auth/jwt';

import { loadEnv } from '../config/env';
import { getUserEmailVerificationStatusFromDb } from '../database/user';
import { ForbiddenError, UnauthorizedError } from '../utils/error';

loadEnv();

const AUTH_COOKIE = 'authjs.session-token';
const SECURE_AUTH_COOKIE = `__Secure-${AUTH_COOKIE}`;

export const authMiddleware = async (
  req: FastifyRequest<{ Params: { userId?: string; email?: string } }>
) => {
  const authToken = req.cookies[SECURE_AUTH_COOKIE] || req.cookies[AUTH_COOKIE];

  if (!authToken) throw new UnauthorizedError();

  const isCookieSecure = !!req.cookies[SECURE_AUTH_COOKIE];

  const decodedToken = await decode({
    token: authToken,
    secret: process.env.AUTH_SECRET!,
    salt: isCookieSecure ? SECURE_AUTH_COOKIE : AUTH_COOKIE
  });

  if (!decodedToken || decodedToken.sub !== req.params.userId) {
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
