import {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions
} from 'fastify';

import {
  deleteClientOptions,
  getClientOptions,
  getClientsOptions,
  postClientOptions,
  updateClientOptions
} from '../options/client';

const clientRoutes = (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes
) => {
  fastify.get('/api/:userId/clients', getClientsOptions);

  fastify.get('/api/:userId/clients/:id', getClientOptions);

  fastify.post('/api/:userId/clients', postClientOptions);

  fastify.put('/api/:userId/clients/:id', updateClientOptions);

  fastify.delete('/api/:userId/clients/:id', deleteClientOptions);

  done();
};

export default clientRoutes;
