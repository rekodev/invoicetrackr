import {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions,
} from 'fastify';

import {
  getClientsOptions,
  getClientOptions,
  postClientOptions,
  updateClientOptions,
  deleteClientOptions,
} from '../options';

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
