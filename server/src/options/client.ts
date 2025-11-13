import {
  clientBodySchema,
  getClientResponseSchema,
  getClientsResponseSchema,
  messageResponseSchema,
  postClientResponseSchema,
  updateClientResponseSchema
} from '@invoicetrackr/types';
import { RouteShorthandOptionsWithHandler } from 'fastify';

import {
  deleteClient,
  getClient,
  getClients,
  postClient,
  updateClient
} from '../controllers/client';
import { authMiddleware } from '../middleware/auth';

export const getClientsOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: getClientsResponseSchema
    }
  },
  preHandler: authMiddleware,
  handler: getClients
};

export const getClientOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: getClientResponseSchema
    }
  },
  preHandler: authMiddleware,
  handler: getClient
};

export const postClientOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: clientBodySchema.omit({ id: true }),
    response: {
      201: postClientResponseSchema
    }
  },
  preHandler: authMiddleware,
  handler: postClient
};

export const updateClientOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: clientBodySchema,
    response: {
      200: updateClientResponseSchema
    }
  },
  preHandler: authMiddleware,
  handler: updateClient
};

export const deleteClientOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: messageResponseSchema
    }
  },
  preHandler: authMiddleware,
  handler: deleteClient
};
