import {
  currentPasswordSchema,
  getUserResponseSchema,
  loginPasswordSchema,
  loginUserResponseSchema,
  messageResponseSchema,
  passwordSchema,
  registerUserResponseSchema,
  updateUserResponseSchema,
  userBodySchema
} from '@invoicetrackr/types';
import { RouteShorthandOptionsWithHandler } from 'fastify';
import z from 'zod/v4';

import {
  changeUserPassword,
  createNewUserPassword,
  deleteUser,
  getUser,
  getUserResetPasswordToken,
  loginUser,
  postUser,
  resetUserPassword,
  updateUser,
  updateUserAccountSettings,
  updateUserProfilePicture,
  updateUserSelectedBankAccount
} from '../controllers/user';
import { authMiddleware } from '../middleware/auth';
import { preValidateFileAndFields } from '../utils/multipart';

export const getUserOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: getUserResponseSchema
    }
  },
  preHandler: authMiddleware,
  handler: getUser
};

export const loginUserOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: z.object({
      email: z
        .email('validation.user.email')
        .max(255, 'validation.user.email')
        .min(5, 'validation.user.email'),
      password: loginPasswordSchema
    }),
    response: {
      200: loginUserResponseSchema
    }
  },
  handler: loginUser
};

export const postUserOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: z
      .object({
        email: z
          .email('validation.user.email')
          .max(255, 'validation.user.email')
          .min(5, 'validation.user.email'),
        password: passwordSchema,
        confirmedPassword: passwordSchema
      })
      .refine((data) => data.password === data.confirmedPassword, {
        message: 'validation.password.mismatch',
        path: ['confirmedPassword']
      }),
    response: {
      201: registerUserResponseSchema
    }
  },
  handler: postUser
};

export const updateUserOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: userBodySchema.pick({
      name: true,
      businessType: true,
      businessNumber: true,
      address: true,
      email: true,
      signature: true
    }),
    response: {
      200: updateUserResponseSchema
    }
  },
  preValidation: preValidateFileAndFields,
  preHandler: authMiddleware,
  handler: updateUser
};

export const deleteUserOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: messageResponseSchema
    }
  },
  preHandler: authMiddleware,
  handler: deleteUser
};

export const updateUserSelectedBankAccountOptions: RouteShorthandOptionsWithHandler =
  {
    schema: {
      response: {
        200: messageResponseSchema
      }
    },
    preHandler: authMiddleware,
    handler: updateUserSelectedBankAccount
  };

export const updateUserProfilePictureOptions: RouteShorthandOptionsWithHandler =
  {
    schema: {
      response: {
        200: messageResponseSchema
      }
    },
    preHandler: authMiddleware,
    handler: updateUserProfilePicture
  };

export const updateUserAccountSettingsOptions: RouteShorthandOptionsWithHandler =
  {
    schema: {
      body: z.object({
        currency: z.string().max(3).min(3),
        language: z.string().max(2).min(2),
        preferredInvoiceLanguage: z.string().max(2).min(2).optional()
      }),
      response: {
        200: messageResponseSchema
      }
    },
    preHandler: authMiddleware,
    handler: updateUserAccountSettings
  };

export const changeUserPasswordOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: z
      .object({
        password: currentPasswordSchema,
        newPassword: passwordSchema,
        confirmedNewPassword: passwordSchema
      })
      .refine((data) => data.newPassword === data.confirmedNewPassword, {
        message: 'validation.password.mismatch',
        path: ['confirmedNewPassword']
      }),
    response: {
      200: messageResponseSchema
    }
  },
  preHandler: authMiddleware,
  handler: changeUserPassword
};

export const resetUserPasswordOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: z.object({
      email: z.string().min(1, 'validation.user.email')
    }),
    response: {
      200: messageResponseSchema
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
      200: messageResponseSchema
    },
    body: z
      .object({
        newPassword: passwordSchema,
        confirmedNewPassword: passwordSchema,
        token: z.string()
      })
      .refine((data) => data.newPassword === data.confirmedNewPassword, {
        message: 'validation.password.mismatch',
        path: ['confirmedNewPassword']
      })
  },
  preHandler: authMiddleware,
  handler: createNewUserPassword
};
