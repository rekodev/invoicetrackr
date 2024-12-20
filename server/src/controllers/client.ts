import { FastifyReply, FastifyRequest } from 'fastify';
import { ClientModel } from '../types/models';
import {
  deleteClientFromDb,
  findClientByEmail,
  getClientFromDb,
  getClientsFromDb,
  insertClientInDb,
  updateClientInDb,
} from '../database';
import { ClientDto } from '../types/dtos';
import { transformClientDto } from '../types/transformers';

export const getClients = async (
  req: FastifyRequest<{ Params: { userId: number } }>,
  reply: FastifyReply
) => {
  const { userId } = req.params;

  const clients = await getClientsFromDb(userId);
  reply.send(clients);
};

export const getClient = async (
  req: FastifyRequest<{ Params: { userId: number; id: number } }>,
  reply: FastifyReply
) => {
  const { userId, id } = req.params;

  const queryResult = await getClientFromDb(userId, id);

  if (!queryResult.length)
    return reply.status(404).send({ message: 'Client not found' });

  const client = queryResult[0];
  reply.send(transformClientDto(client as ClientDto));
};

export const postClient = async (
  req: FastifyRequest<{ Params: { userId: number }; Body: ClientModel }>,
  reply: FastifyReply
) => {
  const { userId } = req.params;
  const clientData = req.body;

  const findClientByEmailQueryResult = await findClientByEmail(
    userId,
    clientData.email
  );

  if (findClientByEmailQueryResult.length)
    return reply.status(400).send({ message: 'Client already exists' });

  const insertionResult = await insertClientInDb(userId, clientData);

  if (!insertionResult.length)
    return reply.status(400).send({ message: 'Unable to add client' });

  const client = insertionResult[0];
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

  const queryResult = await updateClientInDb(userId, id, clientData);

  if (!queryResult.length)
    return reply.status(400).send({ message: 'Unable to update client' });

  const client = queryResult[0];
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

  const queryResult = await deleteClientFromDb(userId, id);

  if (!queryResult.length)
    return reply.status(400).send({ message: 'Unable to delete client' });

  reply.send({ message: 'Client deleted successfully' });
};
