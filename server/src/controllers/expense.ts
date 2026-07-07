import { FastifyReply, FastifyRequest } from 'fastify';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { MultipartFile } from '@fastify/multipart';
import crypto from 'crypto';
import path from 'path';
import { useI18n } from 'fastify-i18n';

import { BadRequestError, NotFoundError } from '../utils/error';
import {
  deleteExpenseAttachmentFromDb,
  getExpenseAttachmentFromDb,
  getExpenseAttachmentsFromDb,
  getExpenseFromDb,
  insertExpenseAttachmentInDb,
  replaceExpenseAttachmentInDb
} from '../database/expense';
import { SelectExpenseAttachment } from '../database/schema';

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

const getSignedAttachmentUrl = (
  attachment: SelectExpenseAttachment,
  disposition?: 'attachment'
) =>
  cloudinary.url(attachment.storageKey, {
    expires_at: Math.floor(Date.now() / 1000) + 300,
    resource_type: attachment.resourceType,
    secure: true,
    sign_url: true,
    type: 'authenticated',
    ...(disposition ? { flags: disposition } : {})
  });

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

  const buffer = await file.toBuffer();

  if (buffer.length > maxExpenseAttachmentSizeBytes) {
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
      filename_override: file.sanitizedFileName,
      access_mode: 'authenticated'
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
  const attachment = await insertExpenseAttachmentInDb({
    userId,
    attachment: {
      expenseId,
      storageKey: uploadedAttachment.public_id,
      secureUrl: uploadedAttachment.secure_url,
      resourceType: uploadedAttachment.resource_type,
      originalFileName: file.originalFileName,
      sanitizedFileName: file.sanitizedFileName,
      mimeType: file.mimeType,
      fileSize: file.fileSize,
      checksum: file.checksum,
      malwareScanStatus: 'not_configured'
    }
  });

  if (!attachment) {
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
  const attachment = await replaceExpenseAttachmentInDb({
    userId,
    expenseId,
    attachmentId,
    attachment: {
      storageKey: uploadedAttachment.public_id,
      secureUrl: uploadedAttachment.secure_url,
      resourceType: uploadedAttachment.resource_type,
      originalFileName: file.originalFileName,
      sanitizedFileName: file.sanitizedFileName,
      mimeType: file.mimeType,
      fileSize: file.fileSize,
      checksum: file.checksum,
      malwareScanStatus: 'not_configured'
    }
  });

  await cloudinary.uploader.destroy(existingAttachment.storageKey, {
    resource_type: existingAttachment.resourceType,
    type: 'authenticated'
  });

  if (!attachment) {
    throw new BadRequestError(i18n.t('error.expenseAttachment.unableToUpload'));
  }

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

  await cloudinary.uploader.destroy(deletedAttachment.storageKey, {
    resource_type: deletedAttachment.resourceType,
    type: 'authenticated'
  });

  reply
    .status(200)
    .send({ message: i18n.t('success.expenseAttachment.removed') });
};
