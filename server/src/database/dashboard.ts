import { and, count, eq, gte, isNull, lte, notExists, sql } from 'drizzle-orm';

import type { OpenInvoiceRow } from '../utils/dashboard';
import { journalPeriod } from '../utils/journal';
import { db } from './db';
import { getPaymentsByInvoiceQuery } from './invoice-payment';
import {
  expenseAttachmentsTable,
  expensesTable,
  invoiceReceiversTable,
  invoicesTable,
  paymentAllocationsTable,
  paymentsTable
} from './schema';

export const getReceivedIncomeByMonthFromDb = async (
  userId: number,
  year: number
) => {
  const { from, to } = journalPeriod(year);
  const month = sql<number>`extract(month from ${paymentsTable.paymentDate})::int`;

  return db
    .select({
      month,
      amount: sql<string>`sum(${paymentAllocationsTable.amount})::text`
    })
    .from(paymentsTable)
    .innerJoin(
      paymentAllocationsTable,
      and(
        eq(paymentAllocationsTable.paymentId, paymentsTable.id),
        eq(paymentAllocationsTable.userId, userId)
      )
    )
    .innerJoin(
      invoicesTable,
      and(
        eq(invoicesTable.id, paymentAllocationsTable.invoiceId),
        eq(invoicesTable.userId, userId),
        eq(invoicesTable.lifecycleStatus, 'issued')
      )
    )
    .where(
      and(
        eq(paymentsTable.userId, userId),
        isNull(paymentsTable.deletedAt),
        gte(paymentsTable.paymentDate, from),
        lte(paymentsTable.paymentDate, to)
      )
    )
    .groupBy(month);
};

export const getExpensesByMonthFromDb = async (userId: number, year: number) => {
  const { from, to } = journalPeriod(year);
  const month = sql<number>`extract(month from ${expensesTable.expenseDate})::int`;

  return db
    .select({
      month,
      total: sql<string>`sum(${expensesTable.eurAmount})::text`,
      deductible: sql<string>`sum(${expensesTable.deductibleAmount})::text`
    })
    .from(expensesTable)
    .where(
      and(
        eq(expensesTable.userId, userId),
        isNull(expensesTable.deletedAt),
        gte(expensesTable.expenseDate, from),
        lte(expensesTable.expenseDate, to)
      )
    )
    .groupBy(month);
};

export const getInvoicedTotalFromDb = async (userId: number, year: number) => {
  const { from, to } = journalPeriod(year);
  const [row] = await db
    .select({
      total: sql<string>`coalesce(sum(${invoicesTable.totalAmount}), 0)::text`
    })
    .from(invoicesTable)
    .where(
      and(
        eq(invoicesTable.userId, userId),
        eq(invoicesTable.lifecycleStatus, 'issued'),
        gte(invoicesTable.date, from),
        lte(invoicesTable.date, to)
      )
    );

  return row?.total ?? '0.00';
};

export const getOpenInvoicesFromDb = async (
  userId: number
): Promise<OpenInvoiceRow[]> => {
  const paymentsByInvoice = getPaymentsByInvoiceQuery(userId);

  return db
    .select({
      id: invoicesTable.id,
      invoiceId: invoicesTable.invoiceId,
      clientName: invoiceReceiversTable.name,
      clientEmail: invoiceReceiversTable.email,
      totalAmount: invoicesTable.totalAmount,
      paidAmount: sql<string>`coalesce(${paymentsByInvoice.paidAmount}, '0.00')`,
      dueDate: invoicesTable.dueDate
    })
    .from(invoicesTable)
    .leftJoin(
      paymentsByInvoice,
      eq(paymentsByInvoice.invoiceId, invoicesTable.id)
    )
    .leftJoin(
      invoiceReceiversTable,
      eq(invoicesTable.receiverId, invoiceReceiversTable.id)
    )
    .where(
      and(
        eq(invoicesTable.userId, userId),
        eq(invoicesTable.lifecycleStatus, 'issued'),
        eq(invoicesTable.status, 'pending')
      )
    );
};

export const getDraftCountFromDb = async (userId: number) => {
  const [row] = await db
    .select({ count: count(invoicesTable.id) })
    .from(invoicesTable)
    .where(
      and(
        eq(invoicesTable.userId, userId),
        eq(invoicesTable.lifecycleStatus, 'draft')
      )
    );

  return Number(row?.count ?? 0);
};

export const getExpensesMissingDocumentsCountFromDb = async (
  userId: number,
  year: number
) => {
  const { from, to } = journalPeriod(year);
  const [row] = await db
    .select({ count: count(expensesTable.id) })
    .from(expensesTable)
    .where(
      and(
        eq(expensesTable.userId, userId),
        isNull(expensesTable.deletedAt),
        gte(expensesTable.expenseDate, from),
        lte(expensesTable.expenseDate, to),
        notExists(
          db
            .select({ id: expenseAttachmentsTable.id })
            .from(expenseAttachmentsTable)
            .where(
              and(
                eq(expenseAttachmentsTable.expenseId, expensesTable.id),
                isNull(expenseAttachmentsTable.deletedAt)
              )
            )
        )
      )
    );

  return Number(row?.count ?? 0);
};
