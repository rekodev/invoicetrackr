import { MultipartFile } from '@fastify/multipart';
import { ExpenseBody, ExpenseInput } from '@invoicetrackr/types';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';
import { FastifyReply, FastifyRequest } from 'fastify';
import { useI18n } from 'fastify-i18n';
import path from 'path';

import {
  deleteExpenseAttachmentFromDb,
  deleteExpenseFromDb,
  getExpenseAttachmentCountsFromDb,
  getExpenseAttachmentFromDb,
  getExpenseAttachmentsFromDb,
  getExpenseFromDb,
  getExpensesFromDb,
  insertExpenseAttachmentInDb,
  insertExpenseInDb,
  replaceExpenseAttachmentInDb,
  updateExpenseInDb
} from '../database/expense';
import { SelectExpense, SelectExpenseAttachment } from '../database/schema';
import { BadRequestError, NotFoundError } from '../utils/error';
import { normalizeExpenseForDb } from '../utils/expense';

const allowedMimeTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png'
]);
const maxExpenseAttachmentSizeBytes = 10 * 1024 * 1024;

const sanitizeFileName = (fileName: string) => {
  const extension = path.extname(fileName).toLowerCase();
  const baseName = path.basename(fileName, extension);
  const safeBaseName = baseName
    .normalize('NFKD')
    .replace(/[^\w-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);

  return `${safeBaseName || 'expense-document'}${extension}`;
};

const getChecksum = (buffer: Buffer) =>
  crypto.createHash('sha256').update(buffer).digest('hex');

const mapExpenseForResponse = (
  expense: SelectExpense,
  attachmentCount?: number
): ExpenseBody => ({
  id: expense.id,
  expenseDate: expense.expenseDate,
  paymentDate: expense.paymentDate,
  supplier: expense.supplier,
  documentNumber: expense.documentNumber,
  description: expense.description,
  category: expense.category as ExpenseBody['category'],
  currency: expense.currency as ExpenseBody['currency'],
  totalAmount: expense.totalAmount,
  eurAmount: expense.eurAmount,
  vatAmount: expense.vatAmount,
  businessUsePercentage: expense.businessUsePercentage,
  deductibleAmount: expense.deductibleAmount,
  paymentMethod: expense.paymentMethod as ExpenseBody['paymentMethod'],
  notes: expense.notes,
  attachmentCount,
  deletedAt: expense.deletedAt,
  createdAt: expense.createdAt,
  updatedAt: expense.updatedAt
});

const getSignedAttachmentUrl = (
  attachment: SelectExpenseAttachment,
  disposition?: 'attachment'
) => cloudinary.utils.private_download_url(
  attachment.storageKey,
  // Raw public IDs already include their extension; image IDs do not.
  attachment.resourceType === 'raw' ? '' : attachment.mimeType === 'application/pdf' ? 'pdf'
    : attachment.mimeType === 'image/png' ? 'png' : 'jpg',
  {
    expires_at: Math.floor(Date.now() / 1000) + 300,
    resource_type: attachment.resourceType === 'raw' ? 'raw' : 'image',
    type: 'authenticated',
    attachment: disposition === 'attachment'
  }
);

// Database mutations are committed before storage cleanup. A cleanup error must
// not invite a retry of an already successful mutation.
const cleanupAttachment = async (
  req: FastifyRequest,
  storageKey: string,
  resourceType: string
) => {
  try {
    const result = await cloudinary.uploader.destroy(storageKey, {
      resource_type: resourceType, type: 'authenticated'
    });
    if (result.result !== 'ok' && result.result !== 'not found') {
      req.log.error({ storageKey, result: result.result }, 'Expense document cleanup failed');
    }
  } catch (error) {
    req.log.error({ err: error, storageKey }, 'Expense document cleanup failed');
  }
};

const mapAttachmentForResponse = (attachment: SelectExpenseAttachment) => ({
  id: attachment.id,
  expenseId: attachment.expenseId,
  storageProvider: attachment.storageProvider,
  resourceType: attachment.resourceType,
  originalFileName: attachment.originalFileName,
  sanitizedFileName: attachment.sanitizedFileName,
  mimeType: attachment.mimeType,
  fileSize: attachment.fileSize,
  checksum: attachment.checksum,
  malwareScanStatus: attachment.malwareScanStatus,
  uploadedAt: attachment.uploadedAt,
  updatedAt: attachment.updatedAt,
  previewUrl: getSignedAttachmentUrl(attachment),
  downloadUrl: getSignedAttachmentUrl(attachment, 'attachment')
});

const readAndValidateAttachmentFile = async (
  file: MultipartFile | undefined,
  unableToUploadMessage: string,
  invalidTypeMessage: string,
  tooLargeMessage: string
) => {
  if (!file) throw new BadRequestError(unableToUploadMessage);

  if (!allowedMimeTypes.has(file.mimetype)) {
    throw new BadRequestError(invalidTypeMessage);
  }

  let buffer: Buffer;
  try {
    buffer = await file.toBuffer();
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'FST_REQ_FILE_TOO_LARGE') {
      throw new BadRequestError(tooLargeMessage);
    }
    throw error;
  }

  if (file.file.truncated || buffer.length > maxExpenseAttachmentSizeBytes) {
    throw new BadRequestError(tooLargeMessage);
  }

  return {
    buffer,
    checksum: getChecksum(buffer),
    sanitizedFileName: sanitizeFileName(file.filename),
    originalFileName: file.filename,
    mimeType: file.mimetype,
    fileSize: buffer.length
  };
};

const mapUploadedAttachmentForDb = (
  file: Awaited<ReturnType<typeof readAndValidateAttachmentFile>>,
  uploadedAttachment: UploadApiResponse
) => ({
  storageKey: uploadedAttachment.public_id,
  secureUrl: uploadedAttachment.secure_url,
  resourceType: uploadedAttachment.resource_type,
  originalFileName: file.originalFileName,
  sanitizedFileName: file.sanitizedFileName,
  mimeType: file.mimeType,
  fileSize: file.fileSize,
  checksum: file.checksum,
  malwareScanStatus: 'not_configured'
});

const uploadExpenseAttachment = async ({
  userId,
  expenseId,
  file
}: {
  userId: number;
  expenseId: number;
  file: {
    buffer: Buffer;
    mimeType: string;
    sanitizedFileName: string;
  };
}): Promise<UploadApiResponse> => {
  const uploadedAttachment = await cloudinary.uploader.upload(
    `data:${file.mimeType};base64,${file.buffer.toString('base64')}`,
    {
      folder: `invoicetrackr/expense-documents/${userId}/${expenseId}`,
      resource_type: 'auto',
      type: 'authenticated',
      use_filename: true,
      unique_filename: true,
      filename_override: file.sanitizedFileName
    }
  );

  if (!uploadedAttachment) {
    throw new BadRequestError('Unable to upload expense document');
  }

  return uploadedAttachment;
};

const assertOwnedExpense = async ({
  userId,
  expenseId,
  notFoundMessage
}: {
  userId: number;
  expenseId: number;
  notFoundMessage: string;
}) => {
  const expense = await getExpenseFromDb(userId, expenseId);

  if (!expense) throw new NotFoundError(notFoundMessage);

  return expense;
};

export const getExpenses = async (
  req: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const [expenses, attachmentCounts] = await Promise.all([
    getExpensesFromDb(userId),
    getExpenseAttachmentCountsFromDb(userId)
  ]);

  reply.status(200).send({
    expenses: expenses.map((expense) =>
      mapExpenseForResponse(expense, attachmentCounts[expense.id] ?? 0)
    )
  });
};

export const getExpense = async (
  req: FastifyRequest<{ Params: { userId: string; expenseId: string } }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const expenseId = Number(req.params.expenseId);
  const i18n = await useI18n(req);
  const expense = await getExpenseFromDb(userId, expenseId);

  if (!expense) throw new NotFoundError(i18n.t('error.expense.notFound'));

  reply.status(200).send({ expense: mapExpenseForResponse(expense) });
};

export const postExpense = async (
  req: FastifyRequest<{ Params: { userId: string }; Body: ExpenseInput }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const i18n = await useI18n(req);
  const expense = await insertExpenseInDb({
    userId,
    ...normalizeExpenseForDb(req.body)
  });

  if (!expense) {
    throw new BadRequestError(i18n.t('error.expense.unableToCreate'));
  }

  reply.status(201).send({
    expense: mapExpenseForResponse(expense),
    message: i18n.t('success.expense.created')
  });
};

export const updateExpense = async (
  req: FastifyRequest<{
    Params: { userId: string; expenseId: string };
    Body: ExpenseInput;
  }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const expenseId = Number(req.params.expenseId);
  const i18n = await useI18n(req);
  const expense = await updateExpenseInDb({
    userId,
    expenseId,
    expense: normalizeExpenseForDb(req.body)
  });

  if (!expense) {
    throw new NotFoundError(i18n.t('error.expense.notFound'));
  }

  reply.status(200).send({
    expense: mapExpenseForResponse(expense),
    message: i18n.t('success.expense.updated')
  });
};

export const deleteExpense = async (
  req: FastifyRequest<{ Params: { userId: string; expenseId: string } }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const expenseId = Number(req.params.expenseId);
  const i18n = await useI18n(req);
  const expense = await deleteExpenseFromDb(userId, expenseId);

  if (!expense) {
    throw new NotFoundError(i18n.t('error.expense.notFound'));
  }

  reply.status(200).send({ message: i18n.t('success.expense.deleted') });
};

export const getExpenseAttachments = async (
  req: FastifyRequest<{ Params: { userId: string; expenseId: string } }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const expenseId = Number(req.params.expenseId);
  const i18n = await useI18n(req);

  await assertOwnedExpense({
    userId,
    expenseId,
    notFoundMessage: i18n.t('error.expense.notFound')
  });

  const attachments = await getExpenseAttachmentsFromDb(userId, expenseId);

  reply.status(200).send({
    attachments: attachments.map(mapAttachmentForResponse)
  });
};

export const getExpenseAttachment = async (
  req: FastifyRequest<{
    Params: { userId: string; expenseId: string; attachmentId: string };
  }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const expenseId = Number(req.params.expenseId);
  const attachmentId = Number(req.params.attachmentId);
  const i18n = await useI18n(req);

  const attachment = await getExpenseAttachmentFromDb(
    userId,
    expenseId,
    attachmentId
  );

  if (!attachment) {
    throw new NotFoundError(i18n.t('error.expenseAttachment.notFound'));
  }

  reply.status(200).send({ attachment: mapAttachmentForResponse(attachment) });
};

export const postExpenseAttachment = async (
  req: FastifyRequest<{
    Params: { userId: string; expenseId: string };
    Body: { file?: MultipartFile };
  }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const expenseId = Number(req.params.expenseId);
  const i18n = await useI18n(req);

  await assertOwnedExpense({
    userId,
    expenseId,
    notFoundMessage: i18n.t('error.expense.notFound')
  });

  const file = await readAndValidateAttachmentFile(
    req.body?.file,
    i18n.t('error.expenseAttachment.unableToUpload'),
    i18n.t('error.expenseAttachment.invalidType'),
    i18n.t('error.expenseAttachment.tooLarge')
  );
  const uploadedAttachment = await uploadExpenseAttachment({
    userId,
    expenseId,
    file
  });
  let attachment: SelectExpenseAttachment | undefined;
  try {
    attachment = await insertExpenseAttachmentInDb({
      userId,
      attachment: {
        expenseId,
        ...mapUploadedAttachmentForDb(file, uploadedAttachment)
      }
    });
  } catch (error) {
    await cleanupAttachment(req, uploadedAttachment.public_id, uploadedAttachment.resource_type);
    throw error;
  }

  if (!attachment) {
    await cleanupAttachment(req, uploadedAttachment.public_id, uploadedAttachment.resource_type);
    throw new BadRequestError(i18n.t('error.expenseAttachment.unableToUpload'));
  }

  reply.status(201).send({
    attachment: mapAttachmentForResponse(attachment),
    message: i18n.t('success.expenseAttachment.uploaded')
  });
};

export const replaceExpenseAttachment = async (
  req: FastifyRequest<{
    Params: { userId: string; expenseId: string; attachmentId: string };
    Body: { file?: MultipartFile };
  }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const expenseId = Number(req.params.expenseId);
  const attachmentId = Number(req.params.attachmentId);
  const i18n = await useI18n(req);
  const existingAttachment = await getExpenseAttachmentFromDb(
    userId,
    expenseId,
    attachmentId
  );

  if (!existingAttachment) {
    throw new NotFoundError(i18n.t('error.expenseAttachment.notFound'));
  }

  const file = await readAndValidateAttachmentFile(
    req.body?.file,
    i18n.t('error.expenseAttachment.unableToUpload'),
    i18n.t('error.expenseAttachment.invalidType'),
    i18n.t('error.expenseAttachment.tooLarge')
  );
  const uploadedAttachment = await uploadExpenseAttachment({
    userId,
    expenseId,
    file
  });
  let attachment: SelectExpenseAttachment | undefined;
  try {
    attachment = await replaceExpenseAttachmentInDb({
      userId,
      expenseId,
      attachmentId,
      expectedStorageKey: existingAttachment.storageKey,
      attachment: mapUploadedAttachmentForDb(file, uploadedAttachment)
    });
  } catch (error) {
    await cleanupAttachment(req, uploadedAttachment.public_id, uploadedAttachment.resource_type);
    throw error;
  }

  if (!attachment) {
    await cleanupAttachment(req, uploadedAttachment.public_id, uploadedAttachment.resource_type);
    throw new BadRequestError(i18n.t('error.expenseAttachment.unableToUpload'));
  }

  await cleanupAttachment(req, existingAttachment.storageKey, existingAttachment.resourceType);

  reply.status(200).send({
    attachment: mapAttachmentForResponse(attachment),
    message: i18n.t('success.expenseAttachment.replaced')
  });
};

export const deleteExpenseAttachment = async (
  req: FastifyRequest<{
    Params: { userId: string; expenseId: string; attachmentId: string };
  }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const expenseId = Number(req.params.expenseId);
  const attachmentId = Number(req.params.attachmentId);
  const i18n = await useI18n(req);
  const deletedAttachment = await deleteExpenseAttachmentFromDb(
    userId,
    expenseId,
    attachmentId
  );

  if (!deletedAttachment) {
    throw new NotFoundError(i18n.t('error.expenseAttachment.notFound'));
  }

  await cleanupAttachment(req, deletedAttachment.storageKey, deletedAttachment.resourceType);

  reply
    .status(200)
    .send({ message: i18n.t('success.expenseAttachment.removed') });
};
