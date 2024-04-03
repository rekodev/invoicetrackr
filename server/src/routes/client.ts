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
} from '../options/client';

const clientRoutes = (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes
) => {
  fastify.get('/api/clients', getClientsOptions);

  fastify.get('/api/clients/:id', getClientOptions);

  fastify.post('/api/clients', postClientOptions);

  fastify.put('/api/clients/:id', updateClientOptions);

  fastify.delete('/api/clients/:id', deleteClientOptions);

  done();
};

export default clientRoutes;
