import { RateLimitPluginOptions } from '@fastify/rate-limit';
import { FastifyRegisterOptions } from 'fastify';

const configuredMax = Number(process.env.API_RATE_LIMIT_MAX);

export const rateLimitPluginOptions: FastifyRegisterOptions<RateLimitPluginOptions> =
  {
    max:
      Number.isSafeInteger(configuredMax) && configuredMax > 0
        ? configuredMax
        : 60,
    timeWindow: '1 minute',
    keyGenerator: (request) => {
      const forwardedFor = request.headers['x-forwarded-for'];
      return forwardedFor
        ? (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor)
            .split(',')[0]
            .trim()
        : request.ip;
    }
  };
