import { Type } from '@sinclair/typebox';
import {
  deleteClient,
  getClient,
  getClients,
  postClient,
  updateClient,
} from '../controllers/client';
import { Client } from '../types/models/client';

export const getClientsOptions = {
  schema: {
    response: {
      200: Type.Array(Client),
    },
  },
  handler: getClients,
};

export const getClientOptions = {
  schema: {
    response: {
      200: Client,
    },
  },
  handler: getClient,
};

export const postClientOptions = {
  schema: {
    body: Type.Partial(Type.Omit(Client, ['id'])),
    response: {
      201: Type.Object({ client: Client, message: Type.String() }),
    },
  },
  handler: postClient,
};

export const updateClientOptions = {
  schema: {
    body: Client,
    response: {
      200: Type.Object({ client: Client, message: Type.String() }),
    },
  },
  handler: updateClient,
};

export const deleteClientOptions = {
  schema: {
    response: {
      200: Type.Object({ message: Type.String() }),
    },
  },
  handler: deleteClient,
};
