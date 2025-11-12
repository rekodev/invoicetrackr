import { RateLimitPluginOptions } from '@fastify/rate-limit';
import { FastifyRegisterOptions } from 'fastify';

export const rateLimitPluginOptions: FastifyRegisterOptions<RateLimitPluginOptions> =
  {
    max: 30,
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
