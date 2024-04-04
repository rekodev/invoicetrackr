import { Type } from '@sinclair/typebox';
import { deleteUser, getUser, postUser, updateUser } from '../controllers/user';
import { User } from '../types/models/user';

export const getUserOptions = {
  schema: {
    response: {
      200: User,
    },
  },
  handler: getUser,
};

export const postUserOptions = {
  schema: {
    body: User,
    response: {
      201: User,
    },
  },
  handler: postUser,
};

export const updateUserOptions = {
  schema: {
    response: {
      200: User,
    },
  },
  handler: updateUser,
};

export const deleteUserOptions = {
  schema: {
    response: {
      200: Type.Object({ message: Type.String() }),
    },
  },
  handler: deleteUser,
};
