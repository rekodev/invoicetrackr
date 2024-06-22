import { Type } from '@sinclair/typebox';
import { RouteShorthandOptionsWithHandler } from 'fastify';
import { deleteUser, getUser, postUser, updateUser } from '../controllers';
import { User } from '../types/models';

export const getUserOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: User,
    },
  },
  handler: getUser,
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
      200: User,
    },
  },
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
