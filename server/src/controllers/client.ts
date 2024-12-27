import { FastifyReply, FastifyRequest } from 'fastify';

import {
  deleteClientFromDb,
  findClientByEmail,
  getClientFromDb,
  getClientsFromDb,
  insertClientInDb,
  updateClientInDb,
} from '../database';
import { ClientModel } from '../types/models';
import { BadRequestError, NotFoundError } from '../utils/errors';

export const getClients = async (
  req: FastifyRequest<{ Params: { userId: number } }>,
  reply: FastifyReply
) => {
  const { userId } = req.params;

  const clients = await getClientsFromDb(userId);

  reply.send({ clients });
};

export const getClient = async (
  req: FastifyRequest<{ Params: { userId: number; id: number } }>,
  reply: FastifyReply
) => {
  const { userId, id } = req.params;

  const client = await getClientFromDb(userId, id);

  if (!client) throw new NotFoundError('Client not found');

  reply.status(200).send(client);
};

export const postClient = async (
  req: FastifyRequest<{ Params: { userId: number }; Body: ClientModel }>,
  reply: FastifyReply
) => {
  const { userId } = req.params;
  const clientData = req.body;

  const foundClient = await findClientByEmail(userId, clientData.email);

  if (foundClient) throw new BadRequestError('Client already exists');

  const insertedClient = await insertClientInDb(userId, clientData);

  if (!insertedClient) throw new BadRequestError('Unable to add client');

  reply.status(200).send({
    client: insertedClient,
    message: 'Client added successfully',
  });
};

export const updateClient = async (
  req: FastifyRequest<{
    Params: { userId: number; id: number };
    Body: ClientModel;
  }>,
  reply: FastifyReply
) => {
  const { userId, id } = req.params;
  const clientData = req.body;

  const updatedClient = await updateClientInDb(userId, id, clientData);

  if (!updatedClient) throw new BadRequestError('Unable to update client');

  reply.status(200).send({
    message: 'Client updated successfully',
    client: updatedClient,
  });
};

export const deleteClient = async (
  req: FastifyRequest<{ Params: { userId: number; id: number } }>,
  reply: FastifyReply
) => {
  const { userId, id } = req.params;

  const deletedClient = await deleteClientFromDb(userId, id);

  if (!deletedClient) throw new BadRequestError('Unable to delete client');

  reply.status(200).send({ message: 'Client deleted successfully' });
};
