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

const authenticatedAccess = [authMiddleware];

export const getClientsOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: getClientsResponseSchema
    }
  },
  preHandler: authenticatedAccess,
  handler: getClients
};

export const getClientOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: getClientResponseSchema
    }
  },
  preHandler: authenticatedAccess,
  handler: getClient
};

export const postClientOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: clientBodySchema.omit({ id: true }),
    response: {
      201: postClientResponseSchema
    }
  },
  preHandler: authenticatedAccess,
  handler: postClient
};

export const updateClientOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: clientBodySchema,
    response: {
      200: updateClientResponseSchema
    }
  },
  preHandler: authenticatedAccess,
  handler: updateClient
};

export const deleteClientOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: messageResponseSchema
    }
  },
  preHandler: authenticatedAccess,
  handler: deleteClient
};
