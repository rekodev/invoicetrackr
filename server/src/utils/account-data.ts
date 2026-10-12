import { strToU8, type Zippable, zipSync } from 'fflate';

import type {
  AccountExportData,
  AccountFiles
} from '../database/account-export';
import {
  attachmentAsset,
  attachmentFormat,
  parseCloudinaryUrl,
  type StorageAsset
} from './storage';

export type ExportFile =
  | { path: string; asset: StorageAsset; format: string }
  | { path: string; url: string };

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

const accountSignatureUrls = ({ profile, signatures }: AccountFiles) => [
  profile?.signatureUrl,
  ...signatures.flatMap(({ senderSignature, receiverSignature }) => [
    senderSignature,
    receiverSignature
  ])
];

const isLegacySignatureAsset = (asset: StorageAsset) =>
  asset.type === 'upload' && !asset.publicId.includes('/');

export const legacySignaturePublicIds = (files: AccountFiles) => [
  ...new Set(
    accountSignatureUrls(files).flatMap((url) => {
      const asset = parseCloudinaryUrl(url)?.asset;

      return asset && isLegacySignatureAsset(asset) ? [asset.publicId] : [];
    })
  )
];

export const accountStorageAssets = (
  files: AccountFiles,
  otherUsersSignatureUrls: (string | null)[]
): StorageAsset[] => {
  const assets = new Map<string, StorageAsset>();
  const add = (asset: StorageAsset) =>
    assets.set(`${asset.resourceType}:${asset.type}:${asset.publicId}`, asset);
  const sharedPublicIds = new Set(
    otherUsersSignatureUrls.flatMap((url) => {
      const asset = parseCloudinaryUrl(url)?.asset;

      return asset ? [asset.publicId] : [];
    })
  );

  files.attachments.forEach((attachment) => add(attachmentAsset(attachment)));

  accountSignatureUrls(files).forEach((url) => {
    const asset = parseCloudinaryUrl(url)?.asset;

    if (
      asset &&
      isLegacySignatureAsset(asset) &&
      !sharedPublicIds.has(asset.publicId)
    )
      add(asset);
  });

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
