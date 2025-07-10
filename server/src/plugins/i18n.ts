import { FastifyInstance } from 'fastify';
import i18n from 'fastify-i18n';
import plugin from 'fastify-plugin';

export default plugin(
  async (server: FastifyInstance) => {
    server.register(i18n, {
      fallbackLocale: 'en',
      messages: {
        en: (await import('../locales/en')).default,
        lt: (await import('../locales/lt')).default
      }
    });
  },
  { name: 'i18n' }
);
