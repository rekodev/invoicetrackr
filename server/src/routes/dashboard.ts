import {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions
} from 'fastify';

import { getDashboardSummaryOptions } from '../options/dashboard';

const dashboardRoutes = (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes
) => {
  fastify.get('/api/:userId/dashboard/summary', getDashboardSummaryOptions);

  done();
};

export default dashboardRoutes;
