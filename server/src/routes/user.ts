import {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions
} from 'fastify';

import {
  changeUserPasswordOptions,
  completeUserOnboardingOptions,
  createNewUserPasswordOptions,
  deleteUserOptions,
  getUserOptions,
  getUserResetPasswordTokenOptions,
  loginUserOptions,
  postOAuthUserOptions,
  postUserOptions,
  resendUserVerificationEmailOptions,
  resetUserPasswordOptions,
  updateUserAccountSettingsOptions,
  updateUserAnalyticsConsentOptions,
  updateUserOptions,
  updateUserProfilePictureOptions,
  updateUserSelectedBankAccountOptions,
  verifyUserEmailOptions
} from '../options/user';

const userRoutes = (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes
) => {
  fastify.get('/api/users/:userId', getUserOptions);

  fastify.post('/api/users/login', loginUserOptions);

  fastify.post('/api/users', postUserOptions);

  fastify.post('/api/users/oauth/google', postOAuthUserOptions);

  fastify.put('/api/users/:userId', updateUserOptions);

  fastify.post(
    '/api/users/:userId/onboarding/complete',
    completeUserOnboardingOptions
  );

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

  fastify.put(
    '/api/users/:userId/analytics-consent',
    updateUserAnalyticsConsentOptions
  );

  fastify.put('/api/users/:userId/change-password', changeUserPasswordOptions);

  fastify.post('/api/forgot-password', resetUserPasswordOptions);

  fastify.post('/api/email-verification/:token', verifyUserEmailOptions);

  fastify.post(
    '/api/users/:userId/email-verification/resend',
    resendUserVerificationEmailOptions
  );

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
