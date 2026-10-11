import { and, asc, count, eq, gte, inArray, isNull, lte, sql } from 'drizzle-orm';

import { db } from './db';
import { getPaymentsByInvoiceQuery } from './invoice-payment';
import {
  getJournalExpenseRowsFromDb,
  getJournalIncomeRowsFromDb
} from './journal';
import {
  expenseAttachmentsTable,
  expensesTable,
  invoiceReceiversTable,
  invoicesTable
} from './schema';

type AnnualRange = { userId: number; from: string; to: string };

export const getAnnualInvoicesFromDb = async ({ userId, from, to }: AnnualRange) => {
  const paidByYearEnd = getPaymentsByInvoiceQuery(userId, to);

  return db
    .select({
      id: invoicesTable.id,
      invoiceNumber: invoicesTable.invoiceId,
      date: invoicesTable.date,
      dueDate: invoicesTable.dueDate,
      clientName: sql<string>`coalesce(${invoiceReceiversTable.name}, '')`,
      clientCode: sql<string>`coalesce(${invoiceReceiversTable.businessNumber}, '')`,
      lifecycleStatus: invoicesTable.lifecycleStatus,
      status: invoicesTable.status,
      vatAmount: invoicesTable.vatAmount,
      totalAmount: invoicesTable.totalAmount,
      paidAmount: sql<string>`coalesce(${paidByYearEnd.paidAmount}, '0.00')`
    })
    .from(invoicesTable)
    .leftJoin(paidByYearEnd, eq(paidByYearEnd.invoiceId, invoicesTable.id))
    .leftJoin(
      invoiceReceiversTable,
      eq(invoicesTable.receiverId, invoiceReceiversTable.id)
    )
    .where(
      and(
        eq(invoicesTable.userId, userId),
        inArray(invoicesTable.lifecycleStatus, ['issued', 'voided']),
        gte(invoicesTable.date, from),
        lte(invoicesTable.date, to)
      )
    )
    .orderBy(asc(invoicesTable.date), asc(invoicesTable.id));
};

export const getExpenseDocumentCountsFromDb = async ({
  userId,
  from,
  to
}: AnnualRange) =>
  db
    .select({
      expenseId: expenseAttachmentsTable.expenseId,
      documentCount: count(expenseAttachmentsTable.id)
    })
    .from(expenseAttachmentsTable)
    .innerJoin(
      expensesTable,
      eq(expensesTable.id, expenseAttachmentsTable.expenseId)
    )
    .where(
      and(
        eq(expensesTable.userId, userId),
        isNull(expensesTable.deletedAt),
        isNull(expenseAttachmentsTable.deletedAt),
        gte(expensesTable.expenseDate, from),
        lte(expensesTable.expenseDate, to)
      )
    )
    .groupBy(expenseAttachmentsTable.expenseId);

export type AnnualInvoiceDbRow = Awaited<
  ReturnType<typeof getAnnualInvoicesFromDb>
>[number];
export type AnnualPaymentDbRow = Awaited<
  ReturnType<typeof getJournalIncomeRowsFromDb>
>[number];
export type AnnualExpenseDbRow = Awaited<
  ReturnType<typeof getJournalExpenseRowsFromDb>
>[number];
