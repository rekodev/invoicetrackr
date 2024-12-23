import createError from '@fastify/error';

export const BadRequestError = createError('BAD_REQUEST', '%s', 400);
export const UnauthorizedError = createError('UNAUTHORIZED', '%s', 401);
export const AlreadyExistsError = createError('ALREADY_EXISTS', '%s', 403);
export const NotFoundError = createError('NOT_FOUND', '%s', 404);
export const InternalServerError = createError(
  'INTERNAL_SERVER_ERROR',
  '%s',
  500
);
