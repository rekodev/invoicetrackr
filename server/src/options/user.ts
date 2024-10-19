import { Type } from '@sinclair/typebox';
import { RouteShorthandOptionsWithHandler } from 'fastify';
import multer from 'fastify-multer';
import {
  deleteUser,
  getUser,
  getUserByEmail,
  postUser,
  updateUser,
  updateUserProfilePicture,
  updateUserSelectedBankAccount,
} from '../controllers';
import { User } from '../types/models';

export const getUserOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: User,
    },
  },
  handler: getUser,
};
export const getUserByEmailOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: User,
    },
  },
  handler: getUserByEmail,
};

export const postUserOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: Type.Object({
      email: Type.String({
        format: 'email',
        maxLength: 255,
        minLength: 5,
        errorMessage: 'Invalid email',
      }),
      password: Type.String({
        minLength: 6,
        errorMessage: 'Password must be at least 6 characters long',
      }),
      confirmedPassword: Type.String({
        minLength: 6,
        errorMessage: 'Must match password',
      }),
    }),
    response: {
      201: Type.Object({ email: Type.String(), message: Type.String() }),
    },
  },
  handler: postUser,
};

export const updateUserOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: User,
    response: {
      200: Type.Object({ user: User, message: Type.String() }),
    },
  },
  preValidation: multer({
    storage: multer.memoryStorage(),
  }).single('signature'),
  handler: updateUser,
};

export const deleteUserOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: Type.Object({ message: Type.String() }),
    },
  },
  handler: deleteUser,
};

export const updateUserSelectedBankAccountOptions: RouteShorthandOptionsWithHandler =
  {
    schema: {
      response: {
        200: Type.Object({ message: Type.String() }),
      },
    },
    handler: updateUserSelectedBankAccount,
  };

export const updateUserProfilePictureOptions: RouteShorthandOptionsWithHandler =
  {
    schema: {
      response: {
        200: Type.Object({ message: Type.String() }),
      },
    },
    preValidation: multer({
      storage: multer.memoryStorage(),
    }).single('profilePicture'),
    handler: updateUserProfilePicture,
  };
