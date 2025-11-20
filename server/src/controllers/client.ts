import { FastifyReply, FastifyRequest } from 'fastify';
import { useI18n } from 'fastify-i18n';

import { BadRequestError, NotFoundError } from '../utils/error';
import {
  deleteClientFromDb,
  findClientByEmail,
  getClientFromDb,
  getClientsFromDb,
  insertClientInDb,
  updateClientInDb
} from '../database/client';
import { ClientBody } from '@invoicetrackr/types';

export const getClients = async (
  req: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);

  const clients = await getClientsFromDb(userId);

  reply.send({ clients });
};

export const getClient = async (
  req: FastifyRequest<{ Params: { userId: string; id: string } }>,
  reply: FastifyReply
) => {
  const id = Number(req.params.id);
  const userId = Number(req.params.userId);
  const i18n = await useI18n(req);

  const client = await getClientFromDb(userId, id);

  if (!client) throw new NotFoundError(i18n.t('error.client.notFound'));

  reply.status(200).send({ client });
};

export const postClient = async (
  req: FastifyRequest<{ Params: { userId: string }; Body: ClientBody }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const clientData = req.body;
  const i18n = await useI18n(req);

  const foundClient = await findClientByEmail(userId, clientData.email || '');

  if (foundClient)
    throw new BadRequestError(i18n.t('error.client.alreadyExists'));

  const insertedClient = await insertClientInDb(userId, {
    ...clientData,
    email: clientData.email || ''
  });

  if (!insertedClient)
    throw new BadRequestError(i18n.t('error.client.unableToCreate'));

  reply.status(201).send({
    client: insertedClient,
    message: i18n.t('success.client.created')
  });
};

export const updateClient = async (
  req: FastifyRequest<{
    Params: { userId: string; id: string };
    Body: ClientBody;
  }>,
  reply: FastifyReply
) => {
  const id = Number(req.params.id);
  const userId = Number(req.params.userId);
  const clientData = req.body;
  const i18n = await useI18n(req);

  const updatedClient = await updateClientInDb(userId, id, clientData);

  if (!updatedClient)
    throw new BadRequestError(i18n.t('error.client.unableToUpdate'));

  reply.status(200).send({
    message: i18n.t('success.client.updated'),
    client: updatedClient
  });
};

export const deleteClient = async (
  req: FastifyRequest<{ Params: { userId: string; id: string } }>,
  reply: FastifyReply
) => {
  const id = Number(req.params.id);
  const userId = Number(req.params.userId);
  const i18n = await useI18n(req);

  const deletedClient = await deleteClientFromDb(userId, id);

  if (!deletedClient)
    throw new BadRequestError(i18n.t('error.client.unableToDelete'));

  reply.status(200).send({ message: i18n.t('success.client.deleted') });
};
