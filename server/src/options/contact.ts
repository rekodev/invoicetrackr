import { RouteShorthandOptionsWithHandler } from 'fastify';
import { Type } from '@sinclair/typebox';

import { postContactMessage } from '../controllers';
import { MessageResponse } from '../types/responses';

export const postContactMessageOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: Type.Object({
      email: Type.String({
        format: 'email',
        maxLength: 255,
        minLength: 5,
        errorMessage: 'Invalid email'
      }),
      message: Type.String({
        minLength: 1,
        maxLength: 5000,
        errorMessage: 'Message must be between 1 and 5000 characters long'
      })
    }),
    response: {
      200: MessageResponse
    }
  },
  handler: postContactMessage
};
