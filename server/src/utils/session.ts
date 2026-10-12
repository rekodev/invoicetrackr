import { FastifyRequest } from 'fastify';
import { decode } from 'next-auth/jwt';

const AUTH_COOKIE = 'authjs.session-token';
const SECURE_AUTH_COOKIE = `__Secure-${AUTH_COOKIE}`;

export const decodeSessionToken = async (req: FastifyRequest) => {
  const authToken = req.cookies[SECURE_AUTH_COOKIE] || req.cookies[AUTH_COOKIE];

  if (!authToken) return null;

  const isCookieSecure = !!req.cookies[SECURE_AUTH_COOKIE];

  try {
    return await decode({
      token: authToken,
      secret: process.env.AUTH_SECRET!,
      salt: isCookieSecure ? SECURE_AUTH_COOKIE : AUTH_COOKIE
    });
  } catch {
    return null;
  }
};
