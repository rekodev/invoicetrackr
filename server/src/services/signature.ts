import type { MultipartFile } from '@fastify/multipart';
import { v2 as cloudinary } from 'cloudinary';
import type { useI18n } from 'fastify-i18n';

import { BadRequestError } from '../utils/error';
import {
  isStoredSignatureUrl,
  SIGNATURE_MAX_BYTES,
  SIGNATURE_MIME_TYPES,
  signatureFolder
} from '../utils/storage';

type I18n = Awaited<ReturnType<typeof useI18n>>;

const isFileTooLargeError = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  error.code === 'FST_REQ_FILE_TOO_LARGE';

export const uploadSignatureImage = async ({
  file,
  userId,
  i18n
}: {
  file: MultipartFile;
  userId: number;
  i18n: I18n;
}) => {
  if (!SIGNATURE_MIME_TYPES.has(file.mimetype))
    throw new BadRequestError(i18n.t('error.user.signatureInvalidType'));

  let fileBuffer: Buffer;

  try {
    fileBuffer = await file.toBuffer();
  } catch (error) {
    if (isFileTooLargeError(error))
      throw new BadRequestError(i18n.t('error.user.signatureTooLarge'));
    throw error;
  }

  if (file.file.truncated || fileBuffer.byteLength > SIGNATURE_MAX_BYTES)
    throw new BadRequestError(i18n.t('error.user.signatureTooLarge'));

  const uploadedSignature = await cloudinary.uploader.upload(
    `data:${file.mimetype};base64,${fileBuffer.toString('base64')}`,
    {
      folder: signatureFolder(userId),
      public_id: crypto.randomUUID(),
      resource_type: 'image'
    }
  );

  if (!uploadedSignature?.secure_url)
    throw new BadRequestError(i18n.t('error.user.unableToUploadSignature'));

  return uploadedSignature.secure_url;
};

export const resolveSignatureUrl = async <
  Url extends string | null | undefined
>({
  file,
  url,
  userId,
  i18n
}: {
  file: MultipartFile | undefined;
  url: Url;
  userId: number;
  i18n: I18n;
}) => {
  if (file) return uploadSignatureImage({ file, userId, i18n });

  if (!isStoredSignatureUrl(url, userId))
    throw new BadRequestError(i18n.t('error.user.signatureInvalid'));

  return url;
};
