import { FastifyRequest } from 'fastify';
import { decode } from 'next-auth/jwt';
import 'dotenv/config';

import { UnauthorizedError } from '../utils/error';

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
