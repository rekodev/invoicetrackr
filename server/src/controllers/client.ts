import { FastifyReply, FastifyRequest } from 'fastify';
import { ClientModel } from '../types/models/client';
import {
  deleteClientFromDb,
  getClientFromDb,
  getClientsFromDb,
  insertClientToDb,
  updateClientInDb,
} from '../../database/client';
import { transformClientDto } from '../utils/transformers';
import { ClientDto } from '../types/dtos/client';

export const getClients = async (
  req: FastifyRequest<{ Params: { userId: number } }>,
  reply: FastifyReply
) => {
  const { userId } = req.params;

  const result = await getClientsFromDb(userId);

  const clients = Array.isArray(result) ? result : null;

  if (!clients) reply.status(400).send({ message: 'No clients found' });

  reply.send(clients.map((client) => transformClientDto(client as ClientDto)));
};

export const getClient = async (
  req: FastifyRequest<{ Params: { userId: number; id: number } }>,
  reply: FastifyReply
) => {
  const { userId, id } = req.params;

  const result = await getClientFromDb(userId, id);

  const client = Array.isArray(result) && result.length > 0 ? result[0] : null;

  if (!client) reply.status(400).send({ message: 'Client not found' });

  reply.send(transformClientDto(client as ClientDto));
};

export const postClient = async (
  req: FastifyRequest<{ Params: { userId: number }; Body: ClientModel }>,
  reply: FastifyReply
) => {
  const { userId } = req.params;
  const clientData = req.body;

  const existingClientQueryResult = await getClientFromDb(
    userId,
    clientData.id
  );

  const existingClient =
    Array.isArray(existingClientQueryResult) &&
    existingClientQueryResult.length > 0
      ? existingClientQueryResult[0]
      : null;

  if (existingClient)
    reply.status(400).send({ message: 'Client already exists' });

  const insertionResult = await insertClientToDb(userId, clientData);

  const client =
    Array.isArray(insertionResult) && insertionResult.length > 0
      ? insertionResult[0]
      : null;

  if (!client) reply.status(400).send({ message: 'Unable to add client' });

  reply.send({
    client: transformClientDto(client as ClientDto),
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

  const result = await updateClientInDb(userId, id, clientData);

  const client = Array.isArray(result) && result.length > 0 ? result[0] : null;

  if (!client) reply.status(400).send({ message: 'Unable to update client' });

  reply.send({
    message: 'Client updated successfully',
    client: transformClientDto(client as ClientDto),
  });
};

export const deleteClient = async (
  req: FastifyRequest<{ Params: { userId: number; id: number } }>,
  reply: FastifyReply
) => {
  const { userId, id } = req.params;

  const result = await deleteClientFromDb(userId, id);

  const client = Array.isArray(result) && result.length > 0 ? result[0] : null;

  if (!client) reply.status(400).send({ message: 'Unable to delete client' });

  reply.send({ message: 'Client deleted successfully' });
};
