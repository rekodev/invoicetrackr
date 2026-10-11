import {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions
} from 'fastify';

import { getTaxEstimateOptions, saveTaxProfileOptions } from '../options/tax';

const taxRoutes = (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes
) => {
  fastify.get('/api/:userId/tax-estimate', getTaxEstimateOptions);
  fastify.put('/api/:userId/tax-profiles/:year', saveTaxProfileOptions);

  done();
};

export default taxRoutes;
