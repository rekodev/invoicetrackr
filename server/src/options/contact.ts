import { RouteShorthandOptionsWithHandler } from 'fastify';
import { Type } from '@sinclair/typebox';

import { postContactMessage } from '../controllers';
import { MessageResponse } from '../types/response';

export const postContactMessageOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: Type.Object({
      email: Type.String({
        format: 'email',
        maxLength: 255,
        minLength: 5,
        errorMessage: 'validation.contact.email'
      }),
      message: Type.String({
        minLength: 1,
        maxLength: 5000,
        errorMessage: 'validation.contact.message'
      })
    }),
    response: {
      200: MessageResponse
    }
  },
  handler: postContactMessage
};
