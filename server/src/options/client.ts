import { Type } from '@sinclair/typebox';
import { RouteShorthandOptionsWithHandler } from 'fastify';
import {
  deleteClient,
  getClient,
  getClients,
  postClient,
  updateClient,
} from '../controllers';
import { Client } from '../types/models';

export const getClientsOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: Type.Array(Client),
    },
  },
  handler: getClients,
};

export const getClientOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: Client,
    },
  },
  handler: getClient,
};

export const postClientOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: Type.Omit(Client, ['id']),
    response: {
      201: Type.Object({ client: Client, message: Type.String() }),
    },
  },
  handler: postClient,
};

export const updateClientOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: Client,
    response: {
      200: Type.Object({ client: Client, message: Type.String() }),
    },
  },
  handler: updateClient,
};

export const deleteClientOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: Type.Object({ message: Type.String() }),
    },
  },
  handler: deleteClient,
};
