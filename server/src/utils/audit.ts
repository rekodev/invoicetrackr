import type { FastifyRequest } from 'fastify';

import { createAuditEvent } from '../database/audit';

export const recordRequestAudit = async ({
  req,
  userId,
  action,
  entityType,
  entityId,
  previousValue,
  newValue
}: {
  req: FastifyRequest;
  userId: number;
  action: string;
  entityType: string;
  entityId?: number | string | null;
  previousValue?: unknown;
  newValue?: unknown;
}) => {
  await createAuditEvent({
    userId,
    actorUserId: userId,
    action,
    entityType,
    entityId: entityId == null ? null : String(entityId),
    previousValue,
    newValue,
    requestId: req.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });
};
