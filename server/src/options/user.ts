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
import { User } from '../types/models';
import { preValidateFileAndFields } from '../utils/multipart';
import { authMiddleware } from '../middleware/auth';

export const getUserOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: User
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
        errorMessage: 'Invalid email'
      }),
      password: Type.String({
        minLength: 6,
        errorMessage: 'Password must be at least 6 characters long'
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
        errorMessage: 'Invalid email'
      }),
      password: Type.String({
        minLength: 6,
        errorMessage: 'Password must be at least 6 characters long'
      }),
      confirmedPassword: Type.String({
        minLength: 6,
        errorMessage: 'Must match password'
      })
    }),
    response: {
      201: Type.Object({ email: Type.String(), message: Type.String() })
    }
  },
  handler: postUser
};

export const updateUserOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: User,
    response: {
      200: Type.Object({ user: User, message: Type.String() })
    }
  },
  preValidation: preValidateFileAndFields,
  preHandler: authMiddleware,
  handler: updateUser
};

export const deleteUserOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: Type.Object({ message: Type.String() })
    }
  },
  preHandler: authMiddleware,
  handler: deleteUser
};

export const updateUserSelectedBankAccountOptions: RouteShorthandOptionsWithHandler =
  {
    schema: {
      response: {
        200: Type.Object({ message: Type.String() })
      }
    },
    preHandler: authMiddleware,
    handler: updateUserSelectedBankAccount
  };

export const updateUserProfilePictureOptions: RouteShorthandOptionsWithHandler =
  {
    schema: {
      response: {
        200: Type.Object({ message: Type.String() })
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
        200: Type.Object({ message: Type.String() })
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
        errorMessage: 'user.password'
      }),
      newPassword: Type.String({
        minLength: 1,
        errorMessage: 'user.newPassword'
      }),
      confirmedNewPassword: Type.String({
        minLength: 1,
        errorMessage: 'user.confirmedNewPassword'
      })
    }),
    response: {
      200: Type.Object({ message: Type.String() })
    }
  },
  preHandler: authMiddleware,
  handler: changeUserPassword
};

export const resetUserPasswordOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: Type.Object({
      email: Type.String({ minLength: 1, errorMessage: 'user.email' })
    }),
    response: {
      200: Type.Object({ message: Type.String() })
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
    body: Type.Object({
      newPassword: Type.String({
        minLength: 1,
        errorMessage: 'user.newPassword'
      }),
      confirmedNewPassword: Type.String({
        minLength: 1,
        errorMessage: 'user.confirmedNewPassword'
      }),
      token: Type.String()
    })
  },
  preHandler: authMiddleware,
  handler: createNewUserPassword
};
