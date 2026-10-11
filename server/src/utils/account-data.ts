import { strToU8, type Zippable,zipSync } from 'fflate';

import type {
  AccountExportData,
  AccountFiles
} from '../database/account-export';

export type StorageAsset = {
  publicId: string;
  resourceType: 'image' | 'raw';
  type: 'upload' | 'authenticated';
};

export type ExportFile =
  | { path: string; asset: StorageAsset; format: string }
  | { path: string; url: string };

const CLOUDINARY_UPLOAD_PATH =
  /\/(image|raw)\/(upload|authenticated)\/(?:v\d+\/)?(.+?)(?:\.([a-z0-9]+))?$/i;

export const parseCloudinaryUrl = (url: string | null | undefined) => {
  if (!url) return null;

  const match = CLOUDINARY_UPLOAD_PATH.exec(url.split('?')[0]);

  if (!match) return null;

  const [, resourceType, type, publicId, format = ''] = match;

  return {
    asset: {
      publicId,
      resourceType: resourceType as StorageAsset['resourceType'],
      type: type as StorageAsset['type']
    },
    format
  };
};

const attachmentAsset = (
  attachment: AccountFiles['attachments'][number]
): StorageAsset => ({
  publicId: attachment.storageKey,
  resourceType: attachment.resourceType === 'raw' ? 'raw' : 'image',
  type: 'authenticated'
});

const attachmentFormat = (attachment: AccountFiles['attachments'][number]) =>
  attachment.resourceType === 'raw'
    ? ''
    : attachment.mimeType === 'application/pdf'
      ? 'pdf'
      : attachment.mimeType === 'image/png'
        ? 'png'
        : 'jpg';

const withExtension = (name: string, format: string) =>
  format && !name.toLowerCase().endsWith(`.${format}`)
    ? `${name}.${format}`
    : name;

export const accountExportFiles = ({
  attachments,
  profile
}: AccountFiles): ExportFile[] => {
  const files: ExportFile[] = attachments
    .filter(({ deletedAt, expenseDeletedAt }) => !deletedAt && !expenseDeletedAt)
    .map((attachment) => ({
      path: `files/expenses/${attachment.expenseId}/${attachment.id}-${attachment.sanitizedFileName}`,
      asset: attachmentAsset(attachment),
      format: attachmentFormat(attachment)
    }));

  const publicFiles = [
    ['files/logo', profile?.logoUrl],
    ['files/signature', profile?.signatureUrl]
  ].flatMap(([name, url]) => {
    const parsed = parseCloudinaryUrl(url);

    return parsed && url
      ? [{ path: withExtension(name!, parsed.format), url }]
      : [];
  });

  return [...files, ...publicFiles];
};

export const accountStorageAssets = ({
  attachments,
  profile,
  signatures
}: AccountFiles): StorageAsset[] => {
  const assets = new Map<string, StorageAsset>();
  const add = (asset: StorageAsset | undefined) => {
    if (asset) assets.set(`${asset.resourceType}:${asset.type}:${asset.publicId}`, asset);
  };

  attachments.forEach((attachment) => add(attachmentAsset(attachment)));

  if (profile?.logoStorageKey)
    add({ publicId: profile.logoStorageKey, resourceType: 'image', type: 'upload' });

  [
    profile?.logoUrl,
    profile?.signatureUrl,
    ...signatures.flatMap(({ senderSignature, receiverSignature }) => [
      senderSignature,
      receiverSignature
    ])
  ].forEach((url) => add(parseCloudinaryUrl(url)?.asset));

  return [...assets.values()];
};

export const buildAccountExportZip = ({
  data,
  readme,
  files
}: {
  data: AccountExportData;
  readme: string;
  files: { path: string; content: Uint8Array }[];
}) => {
  const entries: Zippable = {
    'README.txt': strToU8(readme),
    'data.json': strToU8(
      JSON.stringify({ exportedAt: new Date().toISOString(), ...data }, null, 2)
    )
  };

  files.forEach(({ path, content }) => {
    entries[path] = content;
  });

  return Buffer.from(zipSync(entries));
};
