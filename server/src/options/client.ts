import { Type } from '@sinclair/typebox';
import { RouteShorthandOptionsWithHandler } from 'fastify';
import {
  deleteClient,
  getClient,
  getClients,
  postClient,
  updateClient
} from '../controllers';
import { Client } from '../types/models';
import { authMiddleware } from '../middleware/auth';

export const getClientsOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: Type.Array(Client)
    }
  },
  preHandler: authMiddleware,
  handler: getClients
};

export const getClientOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: Client
    }
  },
  preHandler: authMiddleware,
  handler: getClient
};

export const postClientOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: Type.Omit(Client, ['id']),
    response: {
      201: Type.Object({ client: Client, message: Type.String() })
    }
  },
  preHandler: authMiddleware,
  handler: postClient
};

export const updateClientOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: Client,
    response: {
      200: Type.Object({ client: Client, message: Type.String() })
    }
  },
  preHandler: authMiddleware,
  handler: updateClient
};

export const deleteClientOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: Type.Object({ message: Type.String() })
    }
  },
  preHandler: authMiddleware,
  handler: deleteClient
};
