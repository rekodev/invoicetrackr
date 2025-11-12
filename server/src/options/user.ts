import { Type } from '@sinclair/typebox';
import { RouteShorthandOptionsWithHandler } from 'fastify';
import {
  changeUserPassword,
  createNewUserPassword,
  deleteUser,
  getUser,
  loginUser,
  getUserResetPasswordToken,
  postUser,
  resetUserPassword,
  updateUser,
  updateUserAccountSettings,
  updateUserProfilePicture,
  updateUserSelectedBankAccount
} from '../controllers';
import { User } from '../types';
import { MessageResponse } from '../types/response';
import { preValidateFileAndFields } from '../utils/multipart';
import { authMiddleware } from '../middleware/auth';

export const getUserOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: Type.Object({ user: User })
    }
  },
  preHandler: authMiddleware,
  handler: getUser
};

export const loginUserOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: Type.Object({
      email: Type.String({
        format: 'email',
        maxLength: 255,
        minLength: 5,
        errorMessage: 'validation.user.email'
      }),
      password: Type.String({
        minLength: 6,
        errorMessage: 'validation.user.loginPassword'
      })
    }),
    response: {
      200: { user: User }
    }
  },
  handler: loginUser
};

export const postUserOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: Type.Object({
      email: Type.String({
        format: 'email',
        maxLength: 255,
        minLength: 5,
        errorMessage: 'validation.user.email'
      }),
      password: Type.String({
        minLength: 6,
        errorMessage: 'validation.user.registerPassword'
      }),
      confirmedPassword: Type.String({
        minLength: 6,
        errorMessage: 'validation.user.confirmedPassword'
      })
    }),
    response: {
      201: Type.Intersect([
        Type.Object({ email: Type.String() }),
        MessageResponse
      ])
    }
  },
  handler: postUser
};

export const updateUserOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: Type.Pick(User, [
      'name',
      'businessType',
      'businessNumber',
      'address',
      'email',
      'signature'
    ]),
    response: {
      200: Type.Intersect([
        Type.Object({
          user: Type.Omit(User, [
            'password',
            'stripeCustomerId',
            'stripeSubscriptionId'
          ])
        }),
        MessageResponse
      ])
    }
  },
  preValidation: preValidateFileAndFields,
  preHandler: authMiddleware,
  handler: updateUser
};

export const deleteUserOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: MessageResponse
    }
  },
  preHandler: authMiddleware,
  handler: deleteUser
};

export const updateUserSelectedBankAccountOptions: RouteShorthandOptionsWithHandler =
  {
    schema: {
      response: {
        200: MessageResponse
      }
    },
    preHandler: authMiddleware,
    handler: updateUserSelectedBankAccount
  };

export const updateUserProfilePictureOptions: RouteShorthandOptionsWithHandler =
  {
    schema: {
      response: {
        200: MessageResponse
      }
    },
    preHandler: authMiddleware,
    handler: updateUserProfilePicture
  };

export const updateUserAccountSettingsOptions: RouteShorthandOptionsWithHandler =
  {
    schema: {
      body: Type.Object({
        currency: Type.String({ maxLength: 3, minLength: 3 }),
        language: Type.String({ maxLength: 2, minLength: 2 })
      }),
      response: {
        200: MessageResponse
      }
    },
    preHandler: authMiddleware,
    handler: updateUserAccountSettings
  };

export const changeUserPasswordOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: Type.Object({
      password: Type.String({
        minLength: 1,
        errorMessage: 'validation.user.password'
      }),
      newPassword: Type.String({
        minLength: 1,
        errorMessage: 'validation.user.newPassword'
      }),
      confirmedNewPassword: Type.String({
        minLength: 1,
        errorMessage: 'validation.user.confirmedNewPassword'
      })
    }),
    response: {
      200: MessageResponse
    }
  },
  preHandler: authMiddleware,
  handler: changeUserPassword
};

export const resetUserPasswordOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: Type.Object({
      email: Type.String({
        minLength: 1,
        errorMessage: 'validation.user.email'
      })
    }),
    response: {
      200: MessageResponse
    }
  },
  handler: resetUserPassword
};

export const getUserResetPasswordTokenOptions: RouteShorthandOptionsWithHandler =
  {
    handler: getUserResetPasswordToken
  };

export const createNewUserPasswordOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: MessageResponse
    },
    body: Type.Object({
      newPassword: Type.String({
        minLength: 1,
        errorMessage: 'validation.user.newPassword'
      }),
      confirmedNewPassword: Type.String({
        minLength: 1,
        errorMessage: 'validation.user.confirmedNewPassword'
      }),
      token: Type.String()
    })
  },
  preHandler: authMiddleware,
  handler: createNewUserPassword
};
