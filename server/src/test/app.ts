import fastify, {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest
} from 'fastify';
import {
  serializerCompiler,
  validatorCompiler
} from 'fastify-type-provider-zod';
import { vi } from 'vitest';

export const mockAuthMiddleware = vi.fn().mockImplementation(async () => {
  // Auth passes - do nothing
});

const testErrorHandler = async (
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply
) => {
  if (error.validation) {
    return reply.status(400).send({
      message: 'validation.general',
      errors: error.validation.map((err) => ({
        key: err.instancePath.substring(1).replace(/\//g, '.'),
        value: err.message || 'validation.reviewField'
      })),
      code: error.code
    });
  }

  return reply.status(error.statusCode || 500).send({
    errors: [],
    message: error.message,
    code: error.code
  });
};

export const createTestApp = async (
  routes?: (app: FastifyInstance) => void
) => {
  const app = fastify({
    logger: false
  });

  app.setErrorHandler(testErrorHandler);
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  if (routes) {
    routes(app);
  }

  await app.ready();

  return app;
};
