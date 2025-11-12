import { Type } from '@sinclair/typebox';
import { RouteShorthandOptionsWithHandler } from 'fastify';
import {
  deleteClient,
  getClient,
  getClients,
  postClient,
  updateClient
} from '../controllers/client';
import { Client } from '../types/client';
import { MessageResponse } from '../types/response';
import { authMiddleware } from '../middleware/auth';

export const getClientsOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: Type.Object({ clients: Type.Array(Client) })
    }
  },
  preHandler: authMiddleware,
  handler: getClients
};

export const getClientOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: Type.Object({ client: Client })
    }
  },
  preHandler: authMiddleware,
  handler: getClient
};

export const postClientOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: Type.Omit(Client, ['id']),
    response: {
      201: Type.Intersect([
        Type.Object({ client: Client }),
        MessageResponse
      ])
    }
  },
  preHandler: authMiddleware,
  handler: postClient
};

export const updateClientOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: Client,
    response: {
      200: Type.Intersect([
        Type.Object({ client: Client }),
        MessageResponse
      ])
    }
  },
  preHandler: authMiddleware,
  handler: updateClient
};

export const deleteClientOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: MessageResponse
    }
  },
  preHandler: authMiddleware,
  handler: deleteClient
};
