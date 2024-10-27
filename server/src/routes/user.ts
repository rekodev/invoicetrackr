import {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions,
} from 'fastify';

import {
  deleteUserOptions,
  getUserByEmailOptions,
  getUserOptions,
  postUserOptions,
  updateUserAccountSettingsOptions,
  updateUserOptions,
  updateUserProfilePictureOptions,
  updateUserSelectedBankAccountOptions,
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

  fastify.put(
    '/api/users/:id/selected-bank-account',
    updateUserSelectedBankAccountOptions
  );

  fastify.put(
    '/api/users/:id/profile-picture',
    updateUserProfilePictureOptions
  );

  fastify.put(
    '/api/users/:id/account-settings',
    updateUserAccountSettingsOptions
  );

  done();
};

export default userRoutes;
