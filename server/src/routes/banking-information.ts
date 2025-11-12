import {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions
} from 'fastify';

import {
  deleteBankAccountOptions,
  getBankAccountOptions,
  getBankAccountsOptions,
  postBankAccountOptions,
  updateBankAccountOptions
} from '../options/banking-information';

const clientRoutes = (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes
) => {
  fastify.get('/api/:userId/banking-information', getBankAccountsOptions);

  fastify.get('/api/:userId/banking-information/:id', getBankAccountOptions);

  fastify.post('/api/:userId/banking-information', postBankAccountOptions);

  fastify.put('/api/:userId/banking-information/:id', updateBankAccountOptions);

  fastify.delete(
    '/api/:userId/banking-information/:id',
    deleteBankAccountOptions
  );

  done();
};

export default clientRoutes;
