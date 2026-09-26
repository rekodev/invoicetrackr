import { and, desc, eq } from 'drizzle-orm';

import { db } from './db';
import { emailDeliveriesTable } from './schema';

export const getInvoiceDeliveriesFromDb = (userId: number, invoiceId: number) =>
  db
    .select({
      id: emailDeliveriesTable.id,
      recipient: emailDeliveriesTable.recipient,
      kind: emailDeliveriesTable.kind,
      status: emailDeliveriesTable.status,
      sentAt: emailDeliveriesTable.sentAt,
      createdAt: emailDeliveriesTable.createdAt,
      failedAt: emailDeliveriesTable.failedAt,
      providerMessageId: emailDeliveriesTable.providerMessageId,
      failureCode: emailDeliveriesTable.failureCode,
      content: emailDeliveriesTable.content,
      recoveryExpiresAt: emailDeliveriesTable.recoveryExpiresAt
    })
    .from(emailDeliveriesTable)
    .where(
      and(
        eq(emailDeliveriesTable.userId, userId),
        eq(emailDeliveriesTable.invoiceId, invoiceId)
      )
    )
    .orderBy(desc(emailDeliveriesTable.createdAt));
