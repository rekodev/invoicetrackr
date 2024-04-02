import {
  deleteClient,
  getClient,
  getClients,
  postClient,
  updateClient,
} from '../controllers/client';
import { ClientModel } from '../types/models/client';

const Client = {
  type: 'object',
  properties: <Record<keyof ClientModel, { type: string }>>{
    id: { type: 'number' },
    address: { type: 'string' },
    businessNumber: { type: 'string' },
    businessType: { type: 'string' },
    email: { type: 'string' },
    name: { type: 'string' },
    type: { type: 'string' },
  },
};

export const getClientsOptions = {
  schema: {
    response: {
      200: {
        type: 'array',
        clients: Client,
      },
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
    body: {
      type: 'object',
      required: <Array<keyof ClientModel>>[
        'id',
        'name',
        'businessNumber',
        'businessType',
        'address',
        'type',
      ],
      properties: <Record<keyof ClientModel, { type: string }>>{
        id: { type: 'string' },
        name: { type: 'string' },
        businessNumber: { type: 'string' },
        businessType: { type: 'string' },
        address: { type: 'string' },
        type: { type: 'string' },
        email: { type: 'string' },
      },
    },
    response: {
      201: Client,
    },
  },
  handler: postClient,
};

export const updateClientOptions = {
  schema: {
    response: {
      200: Client,
    },
  },
  handler: updateClient,
};

export const deleteClientOptions = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
  handler: deleteClient,
};
