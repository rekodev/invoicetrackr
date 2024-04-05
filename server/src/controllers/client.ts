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

  try {
    const result = await getClientsFromDb(userId);

    const clients = Array.isArray(result) ? result : null;

    if (!clients) reply.status(400).send({ message: 'Clients not found' });

    reply.send(
      clients.map((client) => transformClientDto(client as ClientDto))
    );
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const getClient = async (
  req: FastifyRequest<{ Params: { userId: number; id: number } }>,
  reply: FastifyReply
) => {
  const { userId, id } = req.params;

  try {
    const result = await getClientFromDb(userId, id);

    const client =
      Array.isArray(result) && result.length > 0 ? result[0] : null;

    if (!client) reply.status(400).send({ message: 'Client not found' });

    reply.send(transformClientDto(client as ClientDto));
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const postClient = async (
  req: FastifyRequest<{ Params: { userId: number }; Body: ClientModel }>,
  reply: FastifyReply
) => {
  const { userId } = req.params;
  const clientData = req.body;

  try {
    const result = await insertClientToDb(userId, clientData);

    const client =
      Array.isArray(result) && result.length > 0 ? result[0] : null;

    if (!client) reply.status(400).send({ message: 'Unable to add client' });

    reply.send({
      client: transformClientDto(client as ClientDto),
      message: 'Client added successfully',
    });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const updateClient = async (
  req: FastifyRequest<{
    Params: { userId: number };
    Body: ClientModel;
  }>,
  reply: FastifyReply
) => {
  const { userId } = req.params;
  const clientData = req.body;

  try {
    const result = await updateClientInDb(userId, clientData.id, clientData);

    const client =
      Array.isArray(result) && result.length > 0 ? result[0] : null;

    if (!client) reply.status(400).send({ message: 'Unable to update client' });

    reply.send({
      message: 'Client updated successfully',
      client: transformClientDto(client as ClientDto),
    });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const deleteClient = async (
  req: FastifyRequest<{ Params: { userId: number; id: number } }>,
  reply: FastifyReply
) => {
  const { userId, id } = req.params;

  try {
    const result = await deleteClientFromDb(userId, id);

    const client =
      Array.isArray(result) && result.length > 0 ? result[0] : null;

    if (!client) reply.status(400).send({ message: 'Unable to delete client' });

    reply.send({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};
