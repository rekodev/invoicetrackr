import type { InvoicePaymentBody } from '@invoicetrackr/types';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';

import { fromCents, toCents } from '../utils/money';
import { db } from './db';
import {
  invoicesTable,
  paymentAllocationsTable,
  paymentsTable
} from './schema';

export const PAYMENT_NOT_FOUND = 'payment-not-found';
export const PAYMENT_INVALID_STATE = 'payment-invalid-state';
export const PAYMENT_EXCEEDS_BALANCE = 'payment-exceeds-balance';
export const PAYMENT_FUTURE_DATE = 'payment-future-date';
export const PAYMENT_CANCEL_BLOCKED = 'payment-cancel-blocked';

export const PAYMENT_UNSUPPORTED_CURRENCY = 'payment-unsupported-currency';

export class PaymentExceedsBalanceError extends Error {
  constructor(public readonly maximumAmount: string) {
    super(PAYMENT_EXCEEDS_BALANCE);
  }
}

export const getPaymentsByInvoiceQuery = (userId: number) => db
  .select({
    invoiceId: paymentAllocationsTable.invoiceId,
    paidAmount: sql<string>`coalesce(sum(${paymentAllocationsTable.amount}), 0)::text`.as('paid_amount'),
    paymentDates: sql<string[]>`array_agg(distinct ${paymentsTable.paymentDate}::text order by ${paymentsTable.paymentDate}::text)`.as('payment_dates')
  })
  .from(paymentAllocationsTable)
  .innerJoin(paymentsTable, and(
    eq(paymentsTable.id, paymentAllocationsTable.paymentId),
    eq(paymentsTable.userId, userId),
    isNull(paymentsTable.deletedAt)
  ))
  .where(eq(paymentAllocationsTable.userId, userId))
  .groupBy(paymentAllocationsTable.invoiceId)
  .as('payments_by_invoice');

export const todayInLithuania = () => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Vilnius',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const value = (type: string) =>
    parts.find((part) => part.type === type)?.value;
  return `${value('year')}-${value('month')}-${value('day')}`;
};

export const getInvoicePaymentsFromDb = async (
  userId: number,
  invoiceId: number
) =>
  db
    .select({
      id: paymentsTable.id,
      paymentDate: paymentsTable.paymentDate,
      amount: paymentAllocationsTable.amount,
      bankReference: paymentsTable.bankReference,
      notes: paymentsTable.notes,
      createdAt: paymentsTable.createdAt
    })
    .from(paymentsTable)
    .innerJoin(
      paymentAllocationsTable,
      and(
        eq(paymentAllocationsTable.paymentId, paymentsTable.id),
        eq(paymentAllocationsTable.userId, userId),
        eq(paymentAllocationsTable.invoiceId, invoiceId)
      )
    )
    .where(
      and(eq(paymentsTable.userId, userId), isNull(paymentsTable.deletedAt))
    )
    .orderBy(desc(paymentsTable.paymentDate), desc(paymentsTable.id));

export const summarizeInvoicePayments = (
  totalAmount: string,
  payments: Array<{ amount: string }>
) => {
  const paid = payments.reduce(
    (sum, payment) => sum + toCents(payment.amount),
    0n
  );
  const outstanding = toCents(totalAmount) - paid;
  return {
    paidAmount: fromCents(paid),
    outstandingAmount: fromCents(outstanding > 0n ? outstanding : 0n)
  };
};

export const assertPaymentFits = (
  totalAmount: string,
  existing: Array<{ id: number; amount: string }>,
  amount: string,
  editingPaymentId?: number
) => {
  const otherPaid = existing.reduce(
    (sum, row) => sum + (row.id === editingPaymentId ? 0n : toCents(row.amount)),
    0n
  );
  const maximum = toCents(totalAmount) - otherPaid;
  if (toCents(amount) > maximum)
    throw new PaymentExceedsBalanceError(fromCents(maximum));
};

type PaymentChange = {
  payment?: InvoicePaymentBody;
  paymentId?: number;
  remove?: boolean;
};

export const changeInvoicePaymentInDb = async (
  userId: number,
  invoiceId: number,
  change: PaymentChange
) =>
  db.transaction(async (tx) => {
    const [invoice] = await tx
      .select({
        id: invoicesTable.id,
        lifecycleStatus: invoicesTable.lifecycleStatus,
        totalAmount: invoicesTable.totalAmount,
        currency: invoicesTable.currency
      })
      .from(invoicesTable)
      .where(
        and(eq(invoicesTable.id, invoiceId), eq(invoicesTable.userId, userId))
      )
      .for('update');

    if (!invoice) throw new Error(PAYMENT_NOT_FOUND);
    if (invoice.lifecycleStatus !== 'issued')
      throw new Error(PAYMENT_INVALID_STATE);
    if ((invoice.currency || 'eur') !== 'eur') throw new Error(PAYMENT_UNSUPPORTED_CURRENCY);
    if (change.payment && change.payment.paymentDate > todayInLithuania())
      throw new Error(PAYMENT_FUTURE_DATE);

    const existing = await tx
      .select({
        id: paymentsTable.id,
        paymentDate: paymentsTable.paymentDate,
        amount: paymentAllocationsTable.amount
      })
      .from(paymentsTable)
      .innerJoin(
        paymentAllocationsTable,
        and(
          eq(paymentAllocationsTable.paymentId, paymentsTable.id),
          eq(paymentAllocationsTable.invoiceId, invoiceId),
          eq(paymentAllocationsTable.userId, userId)
        )
      )
      .where(
        and(eq(paymentsTable.userId, userId), isNull(paymentsTable.deletedAt))
      );

    if (
      change.paymentId &&
      !existing.some((row) => row.id === change.paymentId)
    )
      throw new Error(PAYMENT_NOT_FOUND);

    if (change.payment)
      assertPaymentFits(
        invoice.totalAmount,
        existing,
        change.payment.amount,
        change.paymentId
      );

    let savedPayment;
    if (change.remove && change.paymentId) {
      await tx
        .delete(paymentsTable)
        .where(
          and(
            eq(paymentsTable.id, change.paymentId),
            eq(paymentsTable.userId, userId)
          )
        );
    } else if (change.payment && change.paymentId) {
      [savedPayment] = await tx
        .update(paymentsTable)
        .set({
          paymentDate: change.payment.paymentDate,
          amount: change.payment.amount,
          eurAmount: change.payment.amount,
          bankReference: change.payment.bankReference || null,
          notes: change.payment.notes || null,
          updatedAt: new Date().toISOString()
        })
        .where(
          and(
            eq(paymentsTable.id, change.paymentId),
            eq(paymentsTable.userId, userId)
          )
        )
        .returning();
      await tx
        .update(paymentAllocationsTable)
        .set({
          amount: change.payment.amount,
          updatedAt: new Date().toISOString()
        })
        .where(
          and(
            eq(paymentAllocationsTable.paymentId, change.paymentId),
            eq(paymentAllocationsTable.invoiceId, invoiceId),
            eq(paymentAllocationsTable.userId, userId)
          )
        );
    } else if (change.payment) {
      [savedPayment] = await tx
        .insert(paymentsTable)
        .values({
          userId,
          paymentDate: change.payment.paymentDate,
          amount: change.payment.amount,
          currency: 'eur',
          eurAmount: change.payment.amount,
          method: 'bank_transfer',
          bankReference: change.payment.bankReference || null,
          notes: change.payment.notes || null
        })
        .returning();
      await tx.insert(paymentAllocationsTable).values({
        userId,
        paymentId: savedPayment.id,
        invoiceId,
        amount: change.payment.amount
      });
    }

    const after = existing.filter((row) => row.id !== change.paymentId);
    if (savedPayment)
      after.push({
        id: savedPayment.id,
        paymentDate: savedPayment.paymentDate,
        amount: savedPayment.amount
      });
    const balance = summarizeInvoicePayments(invoice.totalAmount, after);
    const paidAt =
      balance.outstandingAmount === '0.00' && after.length > 0
        ? `${after.reduce((latest, row) => (row.paymentDate > latest ? row.paymentDate : latest), '')}T00:00:00.000Z`
        : null;
    await tx
      .update(invoicesTable)
      .set({
        status: paidAt ? 'paid' : 'pending',
        paidAt,
        updatedAt: new Date().toISOString()
      })
      .where(
        and(eq(invoicesTable.id, invoiceId), eq(invoicesTable.userId, userId))
      );

    return { payment: savedPayment, balance };
  });

export const cancelInvoiceWithoutPaymentsInDb = async (
  userId: number,
  invoiceId: number
) =>
  db.transaction(async (tx) => {
    const [invoice] = await tx
      .select({
        id: invoicesTable.id,
        lifecycleStatus: invoicesTable.lifecycleStatus
      })
      .from(invoicesTable)
      .where(
        and(eq(invoicesTable.id, invoiceId), eq(invoicesTable.userId, userId))
      )
      .for('update');
    if (!invoice) throw new Error(PAYMENT_NOT_FOUND);
    if (invoice.lifecycleStatus !== 'issued')
      throw new Error(PAYMENT_INVALID_STATE);

    const [payment] = await tx
      .select({ id: paymentsTable.id })
      .from(paymentsTable)
      .innerJoin(
        paymentAllocationsTable,
        and(
          eq(paymentAllocationsTable.paymentId, paymentsTable.id),
          eq(paymentAllocationsTable.invoiceId, invoiceId),
          eq(paymentAllocationsTable.userId, userId)
        )
      )
      .where(
        and(eq(paymentsTable.userId, userId), isNull(paymentsTable.deletedAt))
      )
      .limit(1);
    if (payment) throw new Error(PAYMENT_CANCEL_BLOCKED);

    await tx
      .update(invoicesTable)
      .set({
        status: 'canceled',
        lifecycleStatus: 'voided',
        paidAt: null,
        voidedAt: new Date().toISOString(),
        publicInvoiceRevokedAt: new Date().toISOString(),
        recipientSigningRevokedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .where(
        and(eq(invoicesTable.id, invoiceId), eq(invoicesTable.userId, userId))
      );
  });
