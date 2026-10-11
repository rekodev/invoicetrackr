import {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions
} from 'fastify';

import {
  exportAnnualPackageOptions,
  getAnnualPackageOptions
} from '../options/annual-package';

const annualPackageRoutes = (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes
) => {
  fastify.get('/api/:userId/annual-package', getAnnualPackageOptions);
  fastify.get('/api/:userId/annual-package/export', exportAnnualPackageOptions);

  done();
};

export default annualPackageRoutes;
