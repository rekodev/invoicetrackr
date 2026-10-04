import { and, count, desc, eq, isNull } from 'drizzle-orm';

import { sanitizeAuditValue } from '../utils/audit-value';
import { db } from './db';
import {
  auditEventsTable,
  expenseAttachmentsTable,
  expensesTable,
  InsertExpense,
  InsertExpenseAttachment,
  SelectExpense,
  SelectExpenseAttachment
} from './schema';

const activeAttachmentWhere = (
  userId: number,
  expenseId: number,
  attachmentId?: number
) => {
  const conditions = [
    eq(expensesTable.userId, userId),
    eq(expensesTable.id, expenseId),
    isNull(expensesTable.deletedAt),
    isNull(expenseAttachmentsTable.deletedAt)
  ];

  if (attachmentId) {
    conditions.push(eq(expenseAttachmentsTable.id, attachmentId));
  }

  return and(...conditions);
};

export const getExpenseFromDb = async (
  userId: number,
  expenseId: number
): Promise<SelectExpense | undefined> => {
  const expenses = await db
    .select()
    .from(expensesTable)
    .where(
      and(
        eq(expensesTable.userId, userId),
        eq(expensesTable.id, expenseId),
        isNull(expensesTable.deletedAt)
      )
    );

  return expenses.at(0);
};

export const getExpensesFromDb = async (
  userId: number
): Promise<Array<SelectExpense>> => {
  const expenses = await db
    .select()
    .from(expensesTable)
    .where(
      and(eq(expensesTable.userId, userId), isNull(expensesTable.deletedAt))
    )
    .orderBy(desc(expensesTable.expenseDate), desc(expensesTable.id));

  return expenses;
};

export const getExpenseAttachmentCountsFromDb = async (
  userId: number
): Promise<Record<number, number>> => {
  const attachmentCounts = await db
    .select({
      expenseId: expenseAttachmentsTable.expenseId,
      count: count(expenseAttachmentsTable.id)
    })
    .from(expenseAttachmentsTable)
    .innerJoin(
      expensesTable,
      eq(expenseAttachmentsTable.expenseId, expensesTable.id)
    )
    .where(
      and(
        eq(expensesTable.userId, userId),
        isNull(expensesTable.deletedAt),
        isNull(expenseAttachmentsTable.deletedAt)
      )
    )
    .groupBy(expenseAttachmentsTable.expenseId);

  return Object.fromEntries(
    attachmentCounts.map((item) => [item.expenseId, Number(item.count)])
  );
};

export const insertExpenseInDb = async (
  expense: InsertExpense
): Promise<SelectExpense | undefined> => {
  return await db.transaction(async (tx) => {
    const expenses = await tx.insert(expensesTable).values(expense).returning();
    const insertedExpense = expenses.at(0);

    if (!insertedExpense) return;

    await tx.insert(auditEventsTable).values({
      userId: insertedExpense.userId,
      actorUserId: insertedExpense.userId,
      entityType: 'expense',
      entityId: String(insertedExpense.id),
      action: 'expense.created',
      newValue: sanitizeAuditValue(insertedExpense)
    });

    return insertedExpense;
  });
};

export const updateExpenseInDb = async ({
  userId,
  expenseId,
  expense
}: {
  userId: number;
  expenseId: number;
  expense: Partial<InsertExpense>;
}): Promise<SelectExpense | undefined> => {
  return await db.transaction(async (tx) => {
    const previousExpenses = await tx
      .select()
      .from(expensesTable)
      .where(
        and(
          eq(expensesTable.userId, userId),
          eq(expensesTable.id, expenseId),
          isNull(expensesTable.deletedAt)
        )
      );
    const previousExpense = previousExpenses.at(0);

    if (!previousExpense) return;

    const updatedExpenses = await tx
      .update(expensesTable)
      .set({ ...expense, updatedAt: new Date().toISOString() })
      .where(
        and(
          eq(expensesTable.userId, userId),
          eq(expensesTable.id, expenseId),
          isNull(expensesTable.deletedAt)
        )
      )
      .returning();
    const updatedExpense = updatedExpenses.at(0);

    if (!updatedExpense) return;

    await tx.insert(auditEventsTable).values({
      userId,
      actorUserId: userId,
      entityType: 'expense',
      entityId: String(expenseId),
      action: 'expense.updated',
      previousValue: sanitizeAuditValue(previousExpense),
      newValue: sanitizeAuditValue(updatedExpense)
    });

    return updatedExpense;
  });
};

export const deleteExpenseFromDb = async (
  userId: number,
  expenseId: number
): Promise<SelectExpense | undefined> => {
  return await db.transaction(async (tx) => {
    const previousExpenses = await tx
      .select()
      .from(expensesTable)
      .where(
        and(
          eq(expensesTable.userId, userId),
          eq(expensesTable.id, expenseId),
          isNull(expensesTable.deletedAt)
        )
      );
    const previousExpense = previousExpenses.at(0);

    if (!previousExpense) return;

    const deletedExpenses = await tx
      .update(expensesTable)
      .set({
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .where(
        and(
          eq(expensesTable.userId, userId),
          eq(expensesTable.id, expenseId),
          isNull(expensesTable.deletedAt)
        )
      )
      .returning();
    const deletedExpense = deletedExpenses.at(0);

    if (!deletedExpense) return;

    await tx.insert(auditEventsTable).values({
      userId,
      actorUserId: userId,
      entityType: 'expense',
      entityId: String(expenseId),
      action: 'expense.deleted',
      previousValue: sanitizeAuditValue(previousExpense),
      newValue: sanitizeAuditValue(deletedExpense)
    });

    return deletedExpense;
  });
};

export const getExpenseAttachmentsFromDb = async (
  userId: number,
  expenseId: number
): Promise<Array<SelectExpenseAttachment>> => {
  const attachments = await db
    .select({
      id: expenseAttachmentsTable.id,
      expenseId: expenseAttachmentsTable.expenseId,
      storageProvider: expenseAttachmentsTable.storageProvider,
      storageKey: expenseAttachmentsTable.storageKey,
      secureUrl: expenseAttachmentsTable.secureUrl,
      resourceType: expenseAttachmentsTable.resourceType,
      originalFileName: expenseAttachmentsTable.originalFileName,
      sanitizedFileName: expenseAttachmentsTable.sanitizedFileName,
      mimeType: expenseAttachmentsTable.mimeType,
      fileSize: expenseAttachmentsTable.fileSize,
      checksum: expenseAttachmentsTable.checksum,
      malwareScanStatus: expenseAttachmentsTable.malwareScanStatus,
      deletedAt: expenseAttachmentsTable.deletedAt,
      uploadedAt: expenseAttachmentsTable.uploadedAt,
      updatedAt: expenseAttachmentsTable.updatedAt
    })
    .from(expenseAttachmentsTable)
    .innerJoin(
      expensesTable,
      eq(expenseAttachmentsTable.expenseId, expensesTable.id)
    )
    .where(activeAttachmentWhere(userId, expenseId))
    .orderBy(desc(expenseAttachmentsTable.uploadedAt));

  return attachments;
};

export const getExpenseAttachmentFromDb = async (
  userId: number,
  expenseId: number,
  attachmentId: number
): Promise<SelectExpenseAttachment | undefined> => {
  const attachments = await db
    .select({
      id: expenseAttachmentsTable.id,
      expenseId: expenseAttachmentsTable.expenseId,
      storageProvider: expenseAttachmentsTable.storageProvider,
      storageKey: expenseAttachmentsTable.storageKey,
      secureUrl: expenseAttachmentsTable.secureUrl,
      resourceType: expenseAttachmentsTable.resourceType,
      originalFileName: expenseAttachmentsTable.originalFileName,
      sanitizedFileName: expenseAttachmentsTable.sanitizedFileName,
      mimeType: expenseAttachmentsTable.mimeType,
      fileSize: expenseAttachmentsTable.fileSize,
      checksum: expenseAttachmentsTable.checksum,
      malwareScanStatus: expenseAttachmentsTable.malwareScanStatus,
      deletedAt: expenseAttachmentsTable.deletedAt,
      uploadedAt: expenseAttachmentsTable.uploadedAt,
      updatedAt: expenseAttachmentsTable.updatedAt
    })
    .from(expenseAttachmentsTable)
    .innerJoin(
      expensesTable,
      eq(expenseAttachmentsTable.expenseId, expensesTable.id)
    )
    .where(activeAttachmentWhere(userId, expenseId, attachmentId));

  return attachments.at(0);
};

type ExpenseTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Lock the expense so deletion cannot race document mutations.
const lockActiveExpense = async (
  tx: ExpenseTransaction,
  userId: number,
  expenseId: number
) => {
  const expenses = await tx
    .select({ id: expensesTable.id })
    .from(expensesTable)
    .where(and(
      eq(expensesTable.userId, userId),
      eq(expensesTable.id, expenseId),
      isNull(expensesTable.deletedAt)
    ))
    .for('update');

  return expenses.at(0);
};

export const insertExpenseAttachmentInDb = async ({
  userId,
  attachment
}: {
  userId: number;
  attachment: InsertExpenseAttachment;
}): Promise<SelectExpenseAttachment | undefined> => {
  return db.transaction(async (tx) => {
    if (!await lockActiveExpense(tx, userId, attachment.expenseId)) return;

    const inserted = (await tx.insert(expenseAttachmentsTable)
      .values(attachment).returning()).at(0);

    if (inserted) {
      await insertExpenseAttachmentEventInDb(tx, {
        userId,
        expenseId: inserted.expenseId,
        attachmentId: inserted.id,
        action: 'created',
        newValue: inserted
      });
    }

    return inserted;
  });
};

export const replaceExpenseAttachmentInDb = async ({
  userId,
  expenseId,
  attachmentId,
  expectedStorageKey,
  attachment
}: {
  userId: number;
  expenseId: number;
  attachmentId: number;
  expectedStorageKey: string;
  attachment: Omit<InsertExpenseAttachment, 'expenseId'>;
}): Promise<SelectExpenseAttachment | undefined> => {
  return db.transaction(async (tx) => {
    if (!await lockActiveExpense(tx, userId, expenseId)) return;

    const condition = and(
      eq(expenseAttachmentsTable.id, attachmentId),
      eq(expenseAttachmentsTable.expenseId, expenseId),
      isNull(expenseAttachmentsTable.deletedAt),
      eq(expenseAttachmentsTable.storageKey, expectedStorageKey)
    );
    const previous = (await tx.select().from(expenseAttachmentsTable)
      .where(condition)).at(0);
    if (!previous) return;

    const updated = (await tx.update(expenseAttachmentsTable)
      .set({ ...attachment, updatedAt: new Date().toISOString() })
      .where(condition).returning()).at(0);

    if (updated) {
      await insertExpenseAttachmentEventInDb(tx, {
        userId, expenseId, attachmentId,
        action: 'replaced',
        previousValue: previous,
        newValue: updated
      });
    }

    return updated;
  });
};

export const deleteExpenseAttachmentFromDb = async (
  userId: number,
  expenseId: number,
  attachmentId: number
): Promise<SelectExpenseAttachment | undefined> => {
  return db.transaction(async (tx) => {
    if (!await lockActiveExpense(tx, userId, expenseId)) return;

    const condition = and(
      eq(expenseAttachmentsTable.id, attachmentId),
      eq(expenseAttachmentsTable.expenseId, expenseId),
      isNull(expenseAttachmentsTable.deletedAt)
    );
    const previous = (await tx.select().from(expenseAttachmentsTable)
      .where(condition)).at(0);
    if (!previous) return;

    const deleted = (await tx.update(expenseAttachmentsTable)
      .set({ deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
      .where(condition).returning()).at(0);

    if (deleted) {
      await insertExpenseAttachmentEventInDb(tx, {
        userId, expenseId, attachmentId,
        action: 'removed',
        previousValue: previous,
        newValue: deleted
      });
    }

    return deleted;
  });
};

const insertExpenseAttachmentEventInDb = async (
  tx: ExpenseTransaction,
  { userId, expenseId, attachmentId, action, previousValue, newValue }: {
    userId: number;
    expenseId: number;
    attachmentId: number;
    action: 'created' | 'replaced' | 'removed';
    previousValue?: unknown;
    newValue?: unknown;
  }
) => {
  await tx.insert(auditEventsTable).values({
    userId,
    actorUserId: userId,
    entityType: 'expense_attachment',
    entityId: String(attachmentId),
    action: `expense_attachment.${action}`,
    previousValue: sanitizeAuditValue(previousValue),
    newValue: sanitizeAuditValue({ expenseId, value: newValue })
  });
};
