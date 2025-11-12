import createError, { FastifyError } from '@fastify/error';
import { FastifyReply, FastifyRequest } from 'fastify';
import { useI18n } from 'fastify-i18n';

import { getTranslationKeyPrefix } from './url';

export const BadRequestError = createError('BAD_REQUEST', '%s', 400);
export const UnauthorizedError = createError('UNAUTHORIZED', '%s', 401);
export const AlreadyExistsError = createError('ALREADY_EXISTS', '%s', 403);
export const NotFoundError = createError('NOT_FOUND', '%s', 404);
export const InternalServerError = createError(
  'INTERNAL_SERVER_ERROR',
  '%s',
  500
);

export type ValidationError = {
  key: string;
  value: string;
};

export class ValidationErrorCause extends Error {
  constructor(public readonly validation: ValidationError) {
    super(JSON.stringify(validation));
    this.name = 'ValidationErrorCause';
  }
}
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
        const keyPrefix = getTranslationKeyPrefix(request.url);
        const nonDynamicKeyWithPrefix =
          `validation.${keyPrefix}.${key}`.replace(/\.?\d+/g, '');

        return {
          key,
          value:
            i18n.t(nonDynamicKeyWithPrefix) === nonDynamicKeyWithPrefix
              ? err.message || i18n.t('validation.reviewField')
              : i18n.t(nonDynamicKeyWithPrefix)
        };
      }),
      code: error.code
    });
  }

  const errors: Array<{ key: string; value: string }> = [];
  const errorWithCause = error as FastifyError & { cause?: Error };

  if (errorWithCause.cause?.message) {
    const errorMessage = errorWithCause.cause.message;

    try {
      const validationError: ValidationError = JSON.parse(errorMessage);
      errors.push(validationError);
    } catch {}
  }

  return reply.status(error.statusCode || 500).send({
    errors,
    message: error.message,
    code: error.code
  });
}
