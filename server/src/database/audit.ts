import { and, desc, eq } from 'drizzle-orm';

import { sanitizeAuditValue } from '../utils/audit-value';
import { db } from './db';
import { auditEventsTable, type InsertAuditEvent } from './schema';

export const createAuditEvent = async (
  event: Omit<InsertAuditEvent, 'previousValue' | 'newValue'> & {
    previousValue?: unknown;
    newValue?: unknown;
  },
  query: Pick<typeof db, 'insert'> = db
) => {
  await query.insert(auditEventsTable).values({
    ...event,
    previousValue: sanitizeAuditValue(event.previousValue),
    newValue: sanitizeAuditValue(event.newValue)
  });
};

export const getAuditEventsForSupport = async ({
  userId,
  entityType,
  entityId,
  limit = 100
}: {
  userId: number;
  entityType?: string;
  entityId?: string;
  limit?: number;
}) => {
  const conditions = [eq(auditEventsTable.userId, userId)];
  if (entityType) conditions.push(eq(auditEventsTable.entityType, entityType));
  if (entityId) conditions.push(eq(auditEventsTable.entityId, entityId));

  return db
    .select()
    .from(auditEventsTable)
    .where(and(...conditions))
    .orderBy(desc(auditEventsTable.createdAt))
    .limit(Math.min(limit, 250));
};
