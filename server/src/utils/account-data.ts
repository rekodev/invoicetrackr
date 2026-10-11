import { strToU8, type Zippable, zipSync } from 'fflate';

import type {
  AccountExportData,
  AccountFiles
} from '../database/account-export';
import {
  attachmentAsset,
  attachmentFormat,
  type StorageAsset
} from './storage';

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
      resourceType,
      type: type as StorageAsset['type']
    },
    format
  };
};

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
    { name: 'files/logo', url: profile?.logoUrl },
    { name: 'files/signature', url: profile?.signatureUrl }
  ].flatMap(({ name, url }) => {
    const parsed = parseCloudinaryUrl(url);

    return parsed && url
      ? [{ path: withExtension(name, parsed.format), url }]
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

  [
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
    entries[path] = [content, { level: 0 }];
  });

  return Buffer.from(zipSync(entries));
};
