import { and, asc, count, eq, gte, inArray, isNull, lte, sql } from 'drizzle-orm';

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

type AnnualRange = { userId: number; from: string; to: string };

export const getAnnualInvoicesFromDb = async ({ userId, from, to }: AnnualRange) => {
  const paymentsByInvoice = getPaymentsByInvoiceQuery(userId);

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
      paidAmount: sql<string>`coalesce(${paymentsByInvoice.paidAmount}, '0.00')`
    })
    .from(invoicesTable)
    .leftJoin(paymentsByInvoice, eq(paymentsByInvoice.invoiceId, invoicesTable.id))
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

export const getAnnualPaymentsFromDb = async ({ userId, from, to }: AnnualRange) =>
  db
    .select({
      paymentId: paymentsTable.id,
      paymentDate: paymentsTable.paymentDate,
      invoiceNumber: invoicesTable.invoiceId,
      clientName: invoiceReceiversTable.name,
      amount: paymentAllocationsTable.amount,
      method: paymentsTable.method,
      bankReference: paymentsTable.bankReference
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
        eq(invoicesTable.userId, userId)
      )
    )
    .innerJoin(
      invoiceReceiversTable,
      eq(invoicesTable.receiverId, invoiceReceiversTable.id)
    )
    .where(
      and(
        eq(paymentsTable.userId, userId),
        isNull(paymentsTable.deletedAt),
        eq(invoicesTable.lifecycleStatus, 'issued'),
        gte(paymentsTable.paymentDate, from),
        lte(paymentsTable.paymentDate, to)
      )
    )
    .orderBy(paymentsTable.paymentDate, invoicesTable.id, paymentsTable.id);

export const getAnnualExpensesFromDb = async ({ userId, from, to }: AnnualRange) =>
  db
    .select({
      id: expensesTable.id,
      expenseDate: expensesTable.expenseDate,
      paymentDate: expensesTable.paymentDate,
      supplier: expensesTable.supplier,
      documentNumber: expensesTable.documentNumber,
      description: expensesTable.description,
      category: expensesTable.category,
      currency: expensesTable.currency,
      totalAmount: expensesTable.totalAmount,
      eurAmount: expensesTable.eurAmount,
      vatAmount: expensesTable.vatAmount,
      businessUsePercentage: expensesTable.businessUsePercentage,
      deductibleAmount: expensesTable.deductibleAmount,
      paymentMethod: expensesTable.paymentMethod,
      documentCount: sql<number>`(
        select count(*)::int from ${expenseAttachmentsTable}
        where ${expenseAttachmentsTable.expenseId} = ${expensesTable.id}
          and ${expenseAttachmentsTable.deletedAt} is null
      )`
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
    .orderBy(asc(expensesTable.expenseDate), asc(expensesTable.id));

export const getAnnualDraftCountFromDb = async ({ userId, from, to }: AnnualRange) => {
  const [row] = await db
    .select({ count: count(invoicesTable.id) })
    .from(invoicesTable)
    .where(
      and(
        eq(invoicesTable.userId, userId),
        eq(invoicesTable.lifecycleStatus, 'draft'),
        gte(invoicesTable.date, from),
        lte(invoicesTable.date, to)
      )
    );

  return Number(row?.count ?? 0);
};

export type AnnualInvoiceDbRow = Awaited<
  ReturnType<typeof getAnnualInvoicesFromDb>
>[number];
export type AnnualPaymentDbRow = Awaited<
  ReturnType<typeof getAnnualPaymentsFromDb>
>[number];
export type AnnualExpenseDbRow = Awaited<
  ReturnType<typeof getAnnualExpensesFromDb>
>[number];
