import createError from '@fastify/error';
import { RateLimitOptions, RateLimitPluginOptions } from '@fastify/rate-limit';
import { FastifyRequest } from 'fastify';

import { decodeSessionToken } from './session';

const configuredMax = Number(process.env.API_RATE_LIMIT_MAX);

export const ANONYMOUS_RATE_LIMIT_MAX =
  Number.isSafeInteger(configuredMax) && configuredMax > 0 ? configuredMax : 60;
export const AUTHENTICATED_RATE_LIMIT_MAX = Math.max(
  300,
  ANONYMOUS_RATE_LIMIT_MAX
);

export const trustedProxies = ['loopback', 'uniquelocal'];

const RateLimitedError = createError('RATE_LIMITED', '%s', 429);

export const ipRateLimitKey = (request: FastifyRequest) => `ip:${request.ip}`;

export const rateLimitKey = async (request: FastifyRequest) => {
  const session = await decodeSessionToken(request);

  return session?.sub ? `user:${session.sub}` : ipRateLimitKey(request);
};

// Outside production a configured API_RATE_LIMIT_MAX also lifts the strict
// per-IP limits, so E2E runs that log in many accounts from 127.0.0.1 pass.
const ipRateLimitFloor =
  process.env.NODE_ENV !== 'production' &&
  Number.isSafeInteger(configuredMax) &&
  configuredMax > 0
    ? configuredMax
    : 0;

export const ipRateLimit = (
  max: number,
  timeWindow: string
): RateLimitOptions => ({
  max: Math.max(max, ipRateLimitFloor),
  timeWindow,
  keyGenerator: ipRateLimitKey
});

export const userRateLimit = (
  max: number,
  timeWindow: string
): RateLimitOptions => ({
  max,
  timeWindow,
  keyGenerator: (request) =>
    `user:${(request.params as { userId: string }).userId}`
});

export const rateLimitPluginOptions = {
  max: (_request, key) =>
    key.startsWith('user:')
      ? AUTHENTICATED_RATE_LIMIT_MAX
      : ANONYMOUS_RATE_LIMIT_MAX,
  timeWindow: '1 minute',
  hook: 'preParsing',
  keyGenerator: rateLimitKey,
  errorResponseBuilder: () => new RateLimitedError('error.rateLimited'),
  onExceeded: (request, key) => {
    request.log.warn(
      { rateLimitKey: key, clientIp: request.ip, url: request.url },
      'Rate limit exceeded'
    );
  }
} satisfies RateLimitPluginOptions;
