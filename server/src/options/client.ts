import { RouteShorthandOptionsWithHandler } from 'fastify';
import z from 'zod/v4';
import {
  deleteClient,
  getClient,
  getClients,
  postClient,
  updateClient
} from '../controllers/client';
import { clientBodySchema } from '@invoicetrackr/types';
import { messageResponseSchema } from '@invoicetrackr/types';
import { authMiddleware } from '../middleware/auth';

export const getClientsOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: z.object({ clients: z.array(clientBodySchema) })
    }
  },
  preHandler: authMiddleware,
  handler: getClients
};

export const getClientOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: z.object({ client: clientBodySchema })
    }
  },
  preHandler: authMiddleware,
  handler: getClient
};

export const postClientOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: clientBodySchema.omit({ id: true }),
    response: {
      201: z.intersection(
        z.object({ client: clientBodySchema }),
        messageResponseSchema
      )
    }
  },
  preHandler: authMiddleware,
  handler: postClient
};

export const updateClientOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: clientBodySchema,
    response: {
      200: z.intersection(
        z.object({ client: clientBodySchema }),
        messageResponseSchema
      )
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
