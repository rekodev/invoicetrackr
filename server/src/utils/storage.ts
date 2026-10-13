export type StorageAsset = {
  publicId: string;
  resourceType: string;
  type: 'upload' | 'authenticated';
};

type StoredAttachment = {
  storageKey: string;
  resourceType: string | null;
  mimeType: string;
};

export const attachmentAsset = (
  attachment: StoredAttachment
): StorageAsset => ({
  publicId: attachment.storageKey,
  resourceType: attachment.resourceType === 'raw' ? 'raw' : 'image',
  type: 'authenticated'
});

// Raw public IDs already include their extension; image IDs do not.
export const attachmentFormat = (attachment: StoredAttachment) =>
  attachment.resourceType === 'raw'
    ? ''
    : attachment.mimeType === 'application/pdf'
      ? 'pdf'
      : attachment.mimeType === 'image/png'
        ? 'png'
        : 'jpg';

export const businessLogoFolder = (userId: number) =>
  `invoicetrackr/business-logos/${userId}`;

export const signatureFolder = (userId: number) =>
  `invoicetrackr/signatures/${userId}`;

export const SIGNATURE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp'
]);

export const SIGNATURE_MAX_BYTES = 1024 * 1024;

const CLOUDINARY_HOST = 'res.cloudinary.com';
const CLOUDINARY_UPLOAD_PATH =
  /^\/([^/]+)\/(image|raw)\/(upload|authenticated)\/(?:v\d+\/)?(.+?)(?:\.([a-z0-9]+))?$/i;

export const parseCloudinaryUrl = (
  url: string | null | undefined,
  cloudName = process.env.CLOUDINARY_CLOUD_NAME
) => {
  if (!url || !cloudName) return null;

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    return null;
  }

  if (
    !['https:', 'http:'].includes(parsedUrl.protocol) ||
    parsedUrl.hostname !== CLOUDINARY_HOST
  )
    return null;

  const match = CLOUDINARY_UPLOAD_PATH.exec(parsedUrl.pathname);

  if (!match || match[1] !== cloudName) return null;

  const [, , resourceType, type, publicId, format = ''] = match;

  return {
    asset: {
      publicId,
      resourceType,
      type: type as StorageAsset['type']
    },
    format
  };
};

export const isStoredSignatureUrl = (value: unknown, userId: number) => {
  if (value === undefined || value === null || value === '') return true;
  if (typeof value !== 'string') return false;

  const asset = parseCloudinaryUrl(value)?.asset;

  if (!asset) return false;

  return (
    asset.resourceType === 'image' &&
    asset.type === 'upload' &&
    asset.publicId.startsWith(`${signatureFolder(userId)}/`)
  );
};
