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
import { requirePaidEntitlement } from '../middleware/entitlement';

const paidAccess = [authMiddleware, requirePaidEntitlement];

export const getClientsOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: getClientsResponseSchema
    }
  },
  preHandler: paidAccess,
  handler: getClients
};

export const getClientOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: getClientResponseSchema
    }
  },
  preHandler: paidAccess,
  handler: getClient
};

export const postClientOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: clientBodySchema.omit({ id: true }),
    response: {
      201: postClientResponseSchema
    }
  },
  preHandler: paidAccess,
  handler: postClient
};

export const updateClientOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: clientBodySchema,
    response: {
      200: updateClientResponseSchema
    }
  },
  preHandler: paidAccess,
  handler: updateClient
};

export const deleteClientOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: messageResponseSchema
    }
  },
  preHandler: paidAccess,
  handler: deleteClient
};
