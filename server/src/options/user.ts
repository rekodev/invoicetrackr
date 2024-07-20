import { Type } from '@sinclair/typebox';
import { RouteShorthandOptionsWithHandler } from 'fastify';
import multer from 'fastify-multer';
import {
  deleteUser,
  getUser,
  getUserByEmail,
  postUser,
  updateUser,
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
    body: User,
    response: {
      201: User,
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
