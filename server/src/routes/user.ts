import {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions
} from 'fastify';

import {
  changeUserPasswordOptions,
  createNewUserPasswordOptions,
  deleteUserOptions,
  loginUserOptions,
  getUserOptions,
  getUserResetPasswordTokenOptions,
  postUserOptions,
  resetUserPasswordOptions,
  updateUserAccountSettingsOptions,
  updateUserOptions,
  updateUserProfilePictureOptions,
  updateUserSelectedBankAccountOptions
} from '../options/user';

const userRoutes = (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes
) => {
  fastify.get('/api/users/:userId', getUserOptions);

  fastify.post('/api/users/login', loginUserOptions);

  fastify.post('/api/users', postUserOptions);

  fastify.put('/api/users/:userId', updateUserOptions);

  fastify.delete('/api/users/:userId', deleteUserOptions);

  fastify.put(
    '/api/users/:userId/selected-bank-account',
    updateUserSelectedBankAccountOptions
  );

  fastify.put(
    '/api/users/:userId/profile-picture',
    updateUserProfilePictureOptions
  );

  fastify.put(
    '/api/users/:userId/account-settings',
    updateUserAccountSettingsOptions
  );

  fastify.put('/api/users/:userId/change-password', changeUserPasswordOptions);

  fastify.post('/api/forgot-password', resetUserPasswordOptions);

  fastify.get(
    '/api/reset-password-token/:token',
    getUserResetPasswordTokenOptions
  );

  fastify.put(
    '/api/users/:userId/create-new-password',
    createNewUserPasswordOptions
  );

  done();
};

export default userRoutes;
