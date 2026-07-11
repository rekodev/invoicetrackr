import { db } from './db';
import { emailDeliveriesTable } from './schema';

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
