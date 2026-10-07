import { and, asc, eq, gte, isNull, lte, sql } from 'drizzle-orm';

import { db } from './db';
import {
  businessProfilesTable,
  expensesTable,
  invoiceReceiversTable,
  invoiceServicesTable,
  invoicesTable,
  paymentAllocationsTable,
  paymentsTable
} from './schema';

type JournalRange = { userId: number; from: string; to: string };

export const getJournalIncomeRowsFromDb = async ({
  userId,
  from,
  to
}: JournalRange) => {
  const paidBeforeAnyPeriod = sql<string>`coalesce((
    select sum(earlier_allocation.amount)
    from ${paymentAllocationsTable} earlier_allocation
    inner join ${paymentsTable} earlier_payment
      on earlier_payment.id = earlier_allocation.payment_id
    where earlier_allocation.invoice_id = ${invoicesTable.id}
      and earlier_allocation.user_id = ${userId}
      and earlier_payment.deleted_at is null
      and (earlier_payment.payment_date, earlier_payment.id)
        < (${paymentsTable.paymentDate}, ${paymentsTable.id})
  ), 0)::text`;

  return db
    .select({
      paymentId: paymentsTable.id,
      paymentDate: paymentsTable.paymentDate,
      invoiceId: invoicesTable.id,
      documentNumber: invoicesTable.invoiceId,
      receiverName: invoiceReceiversTable.name,
      receiverBusinessNumber: invoiceReceiversTable.businessNumber,
      descriptions: sql<string>`STRING_AGG(${invoiceServicesTable.description}, '; ' ORDER BY ${invoiceServicesTable.id})`,
      receivedAmount: paymentAllocationsTable.amount,
      paidBefore: paidBeforeAnyPeriod,
      vatAmount: invoicesTable.vatAmount,
      totalAmount: invoicesTable.totalAmount
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
    .innerJoin(
      invoiceServicesTable,
      eq(invoiceServicesTable.invoiceId, invoicesTable.id)
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
    .groupBy(
      invoicesTable.id,
      invoiceReceiversTable.id,
      paymentsTable.id,
      paymentAllocationsTable.id
    )
    .orderBy(paymentsTable.paymentDate, invoicesTable.id, paymentsTable.id);
};

export const getJournalExpenseRowsFromDb = async ({
  userId,
  from,
  to
}: JournalRange) =>
  db
    .select({
      expenseId: expensesTable.id,
      expenseDate: expensesTable.expenseDate,
      documentNumber: expensesTable.documentNumber,
      supplier: expensesTable.supplier,
      description: expensesTable.description,
      eurAmount: expensesTable.eurAmount,
      businessUsePercentage: expensesTable.businessUsePercentage,
      deductibleAmount: expensesTable.deductibleAmount
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

export const getJournalOwnerFromDb = async (userId: number) => {
  const [profile] = await db
    .select({
      legalName: businessProfilesTable.legalName,
      activityCertificateNumber: businessProfilesTable.activityCertificateNumber
    })
    .from(businessProfilesTable)
    .where(eq(businessProfilesTable.userId, userId))
    .limit(1);

  return profile ?? { legalName: '', activityCertificateNumber: '' };
};
