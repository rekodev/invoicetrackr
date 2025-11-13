import { RouteShorthandOptionsWithHandler } from 'fastify';
import z from 'zod/v4';
import {
  deleteClient,
  getClient,
  getClients,
  postClient,
  updateClient
} from '../controllers/client';
import { clientSchema } from '../types/client';
import { messageResponseSchema } from '../types/response';
import { authMiddleware } from '../middleware/auth';

export const getClientsOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: z.object({ clients: z.array(clientSchema) })
    }
  },
  preHandler: authMiddleware,
  handler: getClients
};

export const getClientOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: z.object({ client: clientSchema })
    }
  },
  preHandler: authMiddleware,
  handler: getClient
};

export const postClientOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: clientSchema.omit({ id: true }),
    response: {
      201: z.intersection(
        z.object({ client: clientSchema }),
        messageResponseSchema
      )
    }
  },
  preHandler: authMiddleware,
  handler: postClient
};

export const updateClientOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: clientSchema,
    response: {
      200: z.intersection(
        z.object({ client: clientSchema }),
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
