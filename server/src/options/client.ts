import {
  clientMutationBodySchema,
  getClientResponseSchema,
  getClientsResponseSchema,
  messageResponseSchema,
  postClientResponseSchema,
  updateClientResponseSchema
} from '@invoicetrackr/types';
import { RouteShorthandOptionsWithHandler } from 'fastify';

import {
  archiveClient,
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
    body: clientMutationBodySchema.omit({ id: true }),
    response: {
      201: postClientResponseSchema
    }
  },
  preHandler: authenticatedAccess,
  handler: postClient
};

export const updateClientOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: clientMutationBodySchema,
    response: {
      200: updateClientResponseSchema
    }
  },
  preHandler: authenticatedAccess,
  handler: updateClient
};

export const archiveClientOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: messageResponseSchema
    }
  },
  preHandler: authenticatedAccess,
  handler: archiveClient
};
