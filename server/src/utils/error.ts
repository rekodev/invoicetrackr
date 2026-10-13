import createError, { FastifyError } from '@fastify/error';
import { FastifyReply, FastifyRequest } from 'fastify';
import { useI18n } from 'fastify-i18n';

import { captureServerException } from '../analytics/errors';

export const BadRequestError = createError('BAD_REQUEST', '%s', 400);
export const UnauthorizedError = createError('UNAUTHORIZED', '%s', 401);
export const ForbiddenError = createError('FORBIDDEN', '%s', 403);
export const AlreadyExistsError = createError('ALREADY_EXISTS', '%s', 403);
export const ConflictError = createError('CONFLICT', '%s', 409);
export const NotFoundError = createError('NOT_FOUND', '%s', 404);
export const InternalServerError = createError(
  'INTERNAL_SERVER_ERROR',
  '%s',
  500
);

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const i18n = await useI18n(request);

  if (error.validation) {
    return reply.status(400).send({
      message: i18n.t('validation.general'),
      errors: error.validation.map((err) => {
        const key = err.instancePath.substring(1).replace(/\//g, '.');
        return {
          key,
          value: err.message
            ? i18n.t(err.message)
            : i18n.t('validation.reviewField')
        };
      }),
      code: error.code
    });
  }

  if (error.code === 'RATE_LIMITED') {
    return reply.status(429).send({
      errors: [],
      message: i18n.t(error.message, {
        seconds: reply.getHeader('retry-after') ?? 60
      }),
      code: error.code
    });
  }

  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    request.log.error({ err: error }, 'Request failed');
    captureServerException(error, {
      method: request.method,
      route: request.routeOptions.url,
      statusCode,
      source: 'request'
    });
  }

  return reply.status(statusCode).send({
    errors: [],
    message: error.message,
    code: error.code
  });
}
