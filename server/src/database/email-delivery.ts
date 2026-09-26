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
      sentAt: emailDeliveriesTable.sentAt
    })
    .from(emailDeliveriesTable)
    .where(
      and(
        eq(emailDeliveriesTable.userId, userId),
        eq(emailDeliveriesTable.invoiceId, invoiceId)
      )
    )
    .orderBy(desc(emailDeliveriesTable.createdAt));

export const recordEmailDeliveryInDb = async ({
  userId,
  invoiceId,
  providerMessageId,
  kind,
  recipient
}: {
  userId: number;
  invoiceId?: number;
  providerMessageId?: string;
  kind: string;
  recipient: string;
}) => {
  const [delivery] = await db
    .insert(emailDeliveriesTable)
    .values({
      userId,
      invoiceId,
      provider: 'resend',
      providerMessageId,
      kind,
      recipient,
      status: 'sent',
      sentAt: new Date().toISOString()
    })
    .returning();
  return delivery;
};
