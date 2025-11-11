import { FastifyRequest } from 'fastify';

export const languageMiddleware = async (req: FastifyRequest) => {
  const acceptLanguage = req.headers['accept-language'];

  if (!acceptLanguage) {
    req.headers['accept-language'] = 'en';
  }
};
