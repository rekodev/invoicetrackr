import { and, desc, eq, isNull } from 'drizzle-orm';

import {
  InsertExpenseAttachment,
  SelectExpense,
  SelectExpenseAttachment,
  expenseAttachmentEventsTable,
  expenseAttachmentsTable,
  expensesTable
} from './schema';
import { db } from './db';

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

export const insertExpenseAttachmentInDb = async ({
  userId,
  attachment
}: {
  userId: number;
  attachment: InsertExpenseAttachment;
}): Promise<SelectExpenseAttachment | undefined> => {
  const attachments = await db
    .insert(expenseAttachmentsTable)
    .values(attachment)
    .returning();

  const insertedAttachment = attachments.at(0);

  if (insertedAttachment) {
    await insertExpenseAttachmentEventInDb({
      userId,
      expenseId: insertedAttachment.expenseId,
      attachmentId: insertedAttachment.id,
      action: 'created',
      newValue: insertedAttachment
    });
  }

  return insertedAttachment;
};

export const replaceExpenseAttachmentInDb = async ({
  userId,
  expenseId,
  attachmentId,
  attachment
}: {
  userId: number;
  expenseId: number;
  attachmentId: number;
  attachment: Omit<InsertExpenseAttachment, 'expenseId'>;
}): Promise<SelectExpenseAttachment | undefined> => {
  const previousAttachment = await getExpenseAttachmentFromDb(
    userId,
    expenseId,
    attachmentId
  );

  if (!previousAttachment) return;

  const attachments = await db
    .update(expenseAttachmentsTable)
    .set({
      ...attachment,
      updatedAt: new Date().toISOString()
    })
    .where(eq(expenseAttachmentsTable.id, attachmentId))
    .returning();

  const updatedAttachment = attachments.at(0);

  if (updatedAttachment) {
    await insertExpenseAttachmentEventInDb({
      userId,
      expenseId,
      attachmentId,
      action: 'replaced',
      previousValue: previousAttachment,
      newValue: updatedAttachment
    });
  }

  return updatedAttachment;
};

export const deleteExpenseAttachmentFromDb = async (
  userId: number,
  expenseId: number,
  attachmentId: number
): Promise<SelectExpenseAttachment | undefined> => {
  const previousAttachment = await getExpenseAttachmentFromDb(
    userId,
    expenseId,
    attachmentId
  );

  if (!previousAttachment) return;

  const attachments = await db
    .update(expenseAttachmentsTable)
    .set({
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    .where(eq(expenseAttachmentsTable.id, attachmentId))
    .returning();

  const deletedAttachment = attachments.at(0);

  if (deletedAttachment) {
    await insertExpenseAttachmentEventInDb({
      userId,
      expenseId,
      attachmentId,
      action: 'removed',
      previousValue: previousAttachment,
      newValue: deletedAttachment
    });
  }

  return deletedAttachment;
};

export const insertExpenseAttachmentEventInDb = async ({
  userId,
  expenseId,
  attachmentId,
  action,
  previousValue,
  newValue
}: {
  userId: number;
  expenseId: number;
  attachmentId?: number;
  action: 'created' | 'replaced' | 'removed';
  previousValue?: unknown;
  newValue?: unknown;
}) => {
  await db.insert(expenseAttachmentEventsTable).values({
    userId,
    expenseId,
    attachmentId,
    action,
    previousValue,
    newValue
  });
};
