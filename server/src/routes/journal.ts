import {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions
} from 'fastify';

import { exportJournalOptions, getJournalOptions } from '../options/journal';

const journalRoutes = (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes
) => {
  fastify.get('/api/:userId/journal', getJournalOptions);
  fastify.get('/api/:userId/journal/export', exportJournalOptions);

  done();
};

export default journalRoutes;
