import type { ClientMutationBody } from '@invoicetrackr/types';
import { FastifyReply, FastifyRequest } from 'fastify';
import { useI18n } from 'fastify-i18n';

import { analyticsEvents } from '../analytics/events';
import { captureAnalyticsEventForUser } from '../analytics/posthog';
import {
  archiveClientInDb,
  findPotentialDuplicateClientFromDb,
  getClientFromDb,
  getClientsFromDb,
  insertClientInDb,
  updateClientInDb
} from '../database/client';
import { recordRequestAudit } from '../utils/audit';
import { BadRequestError, ConflictError, NotFoundError } from '../utils/error';

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
  req: FastifyRequest<{
    Params: { userId: string };
    Body: ClientMutationBody;
  }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const { duplicateAcknowledged, ...clientData } = req.body;
  const i18n = await useI18n(req);

  const duplicate = await findPotentialDuplicateClientFromDb(userId, {
    name: clientData.name,
    businessNumber: clientData.businessNumber,
    email: clientData.email || ''
  });

  if (duplicate && !duplicateAcknowledged) {
    throw new ConflictError(
      i18n.t('error.client.potentialDuplicate', {
        clientName: duplicate.name
      })
    );
  }

  const insertedClient = await insertClientInDb(userId, {
    ...clientData,
    email: clientData.email || '',
    vatNumber: clientData.vatNumber || null
  });

  if (!insertedClient)
    throw new BadRequestError(i18n.t('error.client.unableToCreate'));

  await recordRequestAudit({
    req,
    userId,
    action: 'client.created',
    entityType: 'client',
    entityId: insertedClient.id,
    newValue: insertedClient
  });

  await captureAnalyticsEventForUser({
    userId,
    event: analyticsEvents.clientCreated,
    properties: {
      business_type: insertedClient.businessType,
      has_email: Boolean(insertedClient.email),
      has_vat_number: Boolean(insertedClient.vatNumber)
    }
  });

  reply.status(201).send({
    client: insertedClient,
    message: i18n.t('success.client.created')
  });
};

export const updateClient = async (
  req: FastifyRequest<{
    Params: { userId: string; id: string };
    Body: ClientMutationBody;
  }>,
  reply: FastifyReply
) => {
  const id = Number(req.params.id);
  const userId = Number(req.params.userId);
  const { duplicateAcknowledged, ...clientData } = req.body;
  const i18n = await useI18n(req);

  const existingClient = await getClientFromDb(userId, id);

  if (!existingClient || existingClient.archivedAt)
    throw new NotFoundError(i18n.t('error.client.notFound'));

  const duplicate = await findPotentialDuplicateClientFromDb(
    userId,
    {
      name: clientData.name,
      businessNumber: clientData.businessNumber,
      email: clientData.email || ''
    },
    id
  );

  if (duplicate && !duplicateAcknowledged) {
    throw new ConflictError(
      i18n.t('error.client.potentialDuplicate', {
        clientName: duplicate.name
      })
    );
  }

  const updatedClient = await updateClientInDb(userId, id, {
    ...clientData,
    email: clientData.email || '',
    vatNumber: clientData.vatNumber || null
  });

  if (!updatedClient)
    throw new BadRequestError(i18n.t('error.client.unableToUpdate'));

  await recordRequestAudit({
    req,
    userId,
    action: 'client.updated',
    entityType: 'client',
    entityId: id,
    previousValue: existingClient,
    newValue: updatedClient
  });

  reply.status(200).send({
    message: i18n.t('success.client.updated'),
    client: updatedClient
  });
};

export const archiveClient = async (
  req: FastifyRequest<{ Params: { userId: string; id: string } }>,
  reply: FastifyReply
) => {
  const id = Number(req.params.id);
  const userId = Number(req.params.userId);
  const i18n = await useI18n(req);

  const client = await getClientFromDb(userId, id);

  if (!client || client.archivedAt)
    throw new NotFoundError(i18n.t('error.client.notFound'));

  const archivedClient = await archiveClientInDb(userId, id);

  if (!archivedClient)
    throw new BadRequestError(i18n.t('error.client.unableToArchive'));

  await recordRequestAudit({
    req,
    userId,
    action: 'client.archived',
    entityType: 'client',
    entityId: id,
    previousValue: client,
    newValue: { ...client, archivedAt: archivedClient.archivedAt }
  });

  reply.status(200).send({ message: i18n.t('success.client.archived') });
};
