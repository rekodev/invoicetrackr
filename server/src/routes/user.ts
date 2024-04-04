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
} from '../options/user';

const userRoutes = (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes
) => {
  fastify.get('/api/users/:id', getUserOptions);

  fastify.post('/api/users', postUserOptions);

  fastify.put('/api/users/:id', updateUserOptions);

  fastify.delete('/api/users/:id', deleteUserOptions);

  done();
};

export default userRoutes;
