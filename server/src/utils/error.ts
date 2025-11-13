import { FastifyReply, FastifyRequest } from 'fastify';
import createError, { FastifyError } from '@fastify/error';
import { useI18n } from 'fastify-i18n';

export const BadRequestError = createError('BAD_REQUEST', '%s', 400);
export const UnauthorizedError = createError('UNAUTHORIZED', '%s', 401);
export const AlreadyExistsError = createError('ALREADY_EXISTS', '%s', 403);
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
  const i18n = useI18n(request);

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

  return reply.status(error.statusCode || 500).send({
    errors: [],
    message: error.message,
    code: error.code
  });
}
