import { and, desc, eq, inArray, isNull, or } from 'drizzle-orm';

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

export type ProviderDeliveryStatus = 'delivered' | 'bounced' | 'failed';

const updatableStatuses: Record<ProviderDeliveryStatus, string[]> = {
  delivered: ['queued', 'sent', 'unknown'],
  bounced: ['queued', 'sent', 'unknown', 'delivered'],
  failed: ['queued', 'sent', 'unknown']
};

export const updateDeliveryStatusFromProviderInDb = async ({
  providerMessageId,
  deliveryId,
  status,
  failureCode,
  occurredAt
}: {
  providerMessageId: string;
  deliveryId?: number;
  status: ProviderDeliveryStatus;
  failureCode?: string;
  occurredAt: string;
}) => {
  const [row] = await db
    .update(emailDeliveriesTable)
    .set({
      status,
      providerMessageId,
      ...(status === 'delivered'
        ? { deliveredAt: occurredAt }
        : { failedAt: occurredAt, failureCode: failureCode || status }),
      updatedAt: new Date().toISOString()
    })
    .where(
      and(
        eq(emailDeliveriesTable.provider, 'resend'),
        or(
          eq(emailDeliveriesTable.providerMessageId, providerMessageId),
          deliveryId
            ? and(
                eq(emailDeliveriesTable.id, deliveryId),
                isNull(emailDeliveriesTable.providerMessageId)
              )
            : undefined
        ),
        inArray(emailDeliveriesTable.status, updatableStatuses[status])
      )
    )
    .returning({ id: emailDeliveriesTable.id });

  return row;
};
