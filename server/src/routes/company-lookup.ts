import {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions
} from 'fastify';

import { searchCompanyLookupsOptions } from '../options/company-lookup';

const companyLookupRoutes = (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes
) => {
  fastify.post(
    '/api/:userId/company-lookups/search',
    searchCompanyLookupsOptions
  );

  done();
};

export default companyLookupRoutes;
