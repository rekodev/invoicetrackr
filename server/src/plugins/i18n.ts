import { FastifyInstance } from 'fastify';
import i18n from 'fastify-i18n';
import plugin from 'fastify-plugin';

import en from '../locales/en';
import lt from '../locales/lt';

export default plugin(
  async (server: FastifyInstance) => {
    server.register(i18n, {
      fallbackLocale: 'en',
      messages: { en, lt }
    });
  },
  { name: 'i18n' }
);
