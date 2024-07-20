import {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions,
} from 'fastify';

import {
  getUserOptions,
  postUserOptions,
  updateUserOptions,
  deleteUserOptions,
  getUserByEmailOptions,
} from '../options';

const userRoutes = (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes
) => {
  fastify.get('/api/users/:id', getUserOptions);

  fastify.get('/api/users/email/:email', getUserByEmailOptions);

  fastify.post('/api/users', postUserOptions);

  fastify.put('/api/users/:id', updateUserOptions);

  fastify.delete('/api/users/:id', deleteUserOptions);

  done();
};

export default userRoutes;
