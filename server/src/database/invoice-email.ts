import type { InvoiceEmailContent } from '@invoicetrackr/types';
import { randomUUID } from 'crypto';
import { and, eq, inArray, sql } from 'drizzle-orm';

import type { InvoiceEmailProviderPayload } from '../utils/invoice-email';
import { db } from './db';
import { emailDeliveriesTable, invoicesTable, paymentAllocationsTable, paymentsTable } from './schema';

export type InvoiceEmailAttempt = typeof emailDeliveriesTable.$inferSelect;
const scope = (userId: number, invoiceId: number) => and(
  eq(emailDeliveriesTable.userId, userId), eq(emailDeliveriesTable.invoiceId, invoiceId)
);
export const getInvoiceEmailAttemptInDb = async (userId: number, invoiceId: number, deliveryId: number) => {
  const [row] = await db.select().from(emailDeliveriesTable).where(and(scope(userId, invoiceId), eq(emailDeliveriesTable.id, deliveryId)));
  return row;
};

// Serialize reservations with invoice/payment changes. Never hold the lock during external calls.
export const reserveInvoiceEmailAttemptInDb = async ({ userId, invoiceId, attemptKey, content,
  deliveryId, replacesDeliveryId, confirmPossibleDuplicate = false }: {
  userId: number; invoiceId: number; attemptKey?: string; content?: InvoiceEmailContent;
  deliveryId?: number; replacesDeliveryId?: number; confirmPossibleDuplicate?: boolean;
}) => db.transaction(async (tx) => {
  const [invoice] = await tx.select().from(invoicesTable).where(and(
    eq(invoicesTable.userId, userId), eq(invoicesTable.id, invoiceId)
  )).for('update');
  if (!invoice) throw new Error('email-invoice-not-found');
  const [existing] = await tx.select().from(emailDeliveriesTable).where(deliveryId !== undefined
    ? and(scope(userId, invoiceId), eq(emailDeliveriesTable.id, deliveryId))
    : and(eq(emailDeliveriesTable.userId, userId), eq(emailDeliveriesTable.attemptKey, attemptKey!)));
  if (deliveryId !== undefined && !existing) throw new Error('email-attempt-not-found');
  if (existing && existing.invoiceId !== invoiceId) throw new Error('email-attempt-conflict');
  if (existing && content && Object.entries(content).some(([key, value]) =>
    existing.content?.[key as keyof InvoiceEmailContent] !== value)) throw new Error('email-attempt-conflict');
  if (existing?.failureCode === 'superseded-unknown') throw new Error('email-recovery-expired');
  if (existing && ['sent', 'delivered', 'failed', 'bounced'].includes(existing.status)) return { attempt: existing, claimed: false };
  if (invoice.lifecycleStatus !== 'issued' || invoice.status === 'canceled') throw new Error('email-requires-issued');
  const effectiveContent = existing?.content || content;
  if (!effectiveContent) throw new Error('email-attempt-not-recoverable');
  if (effectiveContent.kind === 'reminder') {
    const [paid] = await tx.select({ amount: sql<string>`coalesce(sum(${paymentAllocationsTable.amount}), 0)` })
      .from(paymentAllocationsTable).innerJoin(paymentsTable, and(
        eq(paymentsTable.id, paymentAllocationsTable.paymentId), eq(paymentsTable.userId, userId)
      )).where(and(eq(paymentAllocationsTable.userId, userId), eq(paymentAllocationsTable.invoiceId, invoiceId), sql`${paymentsTable.deletedAt} is null`));
    if (invoice.status === 'paid' || Number(invoice.totalAmount) <= Number(paid.amount)) {
      if (!existing) throw new Error('email-reminder-paid');
      // Payment can arrive while a send result is unknown. Stop further provider
      // calls without claiming the original failed or permanently blocking the
      // invoice's other email actions.
      const [stopped] = await tx.update(emailDeliveriesTable).set({
        status: existing.providerStartedAt ? 'unknown' : 'failed',
        failureCode: 'reminder-no-longer-payable', providerPayload: null,
        failedAt: existing.providerStartedAt ? null : new Date().toISOString(),
        leaseToken: null, leaseUntil: null, updatedAt: new Date().toISOString()
      }).where(eq(emailDeliveriesTable.id, existing.id)).returning();
      return { attempt: stopped, claimed: false };
    }
  }
  const now = new Date();
  if (existing?.providerStartedAt && (!existing.recoveryExpiresAt || new Date(existing.recoveryExpiresAt) <= now)) throw new Error('email-recovery-expired');
  if (existing?.leaseUntil && new Date(existing.leaseUntil) > now) return { attempt: existing, claimed: false };
  const pending = await tx.select().from(emailDeliveriesTable).where(and(scope(userId, invoiceId),
    inArray(emailDeliveriesTable.status, ['queued', 'unknown'])));
  for (const unresolved of pending) {
    if (['superseded-unknown', 'reminder-no-longer-payable'].includes(unresolved.failureCode || '')) continue;
    if (unresolved.id === existing?.id) continue;
    const expired = unresolved.providerStartedAt && unresolved.recoveryExpiresAt && new Date(unresolved.recoveryExpiresAt) <= now;
    if (!(expired && confirmPossibleDuplicate && replacesDeliveryId === unresolved.id)) throw new Error('email-unresolved-attempt');
  }
  if (replacesDeliveryId && !existing) {
    const [previous] = await tx.select().from(emailDeliveriesTable).where(and(scope(userId, invoiceId), eq(emailDeliveriesTable.id, replacesDeliveryId)));
    if (!previous) throw new Error('email-attempt-not-found');
    if (['queued', 'unknown'].includes(previous.status)) {
      if (!previous.recoveryExpiresAt || new Date(previous.recoveryExpiresAt) > now || !confirmPossibleDuplicate) throw new Error('email-unresolved-attempt');
      // Keep the historical uncertainty visible, but no longer block the confirmed replacement.
      await tx.update(emailDeliveriesTable).set({ status: 'unknown', failureCode: 'superseded-unknown',
        providerPayload: null, leaseUntil: null, leaseToken: null, updatedAt: now.toISOString()
      }).where(eq(emailDeliveriesTable.id, previous.id));
    }
  }
  const leaseToken = randomUUID();
  const leaseUntil = new Date(now.getTime() + 90_000).toISOString();
  if (existing) {
    const [attempt] = await tx.update(emailDeliveriesTable).set({ leaseToken, leaseUntil,
      updatedAt: now.toISOString() }).where(eq(emailDeliveriesTable.id, existing.id)).returning();
    return { attempt, claimed: true };
  }
  const [attempt] = await tx.insert(emailDeliveriesTable).values({ userId, invoiceId, attemptKey,
    provider: 'resend', kind: effectiveContent.kind, recipient: effectiveContent.recipientEmail,
    content: effectiveContent, status: 'queued', leaseToken, leaseUntil }).returning();
  return { attempt, claimed: true };
});

export const saveInvoiceEmailPayloadInDb = async (attempt: InvoiceEmailAttempt, payload: InvoiceEmailProviderPayload) => {
  const [row] = await db.update(emailDeliveriesTable).set({ providerPayload: payload,
    providerStartedAt: attempt.providerStartedAt || new Date().toISOString(),
    recoveryExpiresAt: attempt.recoveryExpiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000 - 5 * 60 * 1000).toISOString(),
    leaseUntil: new Date(Date.now() + 90_000).toISOString(), updatedAt: new Date().toISOString()
  }).where(and(scope(attempt.userId, attempt.invoiceId!), eq(emailDeliveriesTable.id, attempt.id),
    eq(emailDeliveriesTable.leaseToken, attempt.leaseToken!))).returning();
  return row;
};

export const finishInvoiceEmailAttemptInDb = async (attempt: InvoiceEmailAttempt, status: 'sent' | 'failed' | 'unknown',
  providerMessageId?: string, failureCode?: string) => {
  const now = new Date().toISOString();
  const [row] = await db.update(emailDeliveriesTable).set({ status, providerMessageId, failureCode: failureCode || null,
    ...(status === 'sent' ? { sentAt: now, providerPayload: null } : {}),
    ...(status === 'failed' ? { failedAt: now, providerPayload: null } : {}),
    leaseToken: null, leaseUntil: null, updatedAt: now
  }).where(and(scope(attempt.userId, attempt.invoiceId!), eq(emailDeliveriesTable.id, attempt.id),
    inArray(emailDeliveriesTable.status, ['queued', 'unknown']),
    ...(status === 'sent' ? [] : [eq(emailDeliveriesTable.leaseToken, attempt.leaseToken!)]))).returning();
  return row || getInvoiceEmailAttemptInDb(attempt.userId, attempt.invoiceId!, attempt.id);
};
