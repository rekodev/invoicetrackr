import type { FastifyBaseLogger } from 'fastify';

import type { ExportFile } from '../utils/account-data';
import type { StorageAsset } from '../utils/storage';
import {
  destroyStorageAsset,
  destroyStorageFolder,
  signedDownloadUrl
} from './storage';

const DOWNLOAD_CONCURRENCY = 4;

const downloadFile = async (file: ExportFile) => {
  const url = 'url' in file ? file.url : signedDownloadUrl(file.asset, file.format);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Account export download of ${file.path} failed: ${response.status}`);
  }

  return {
    path: file.path,
    content: new Uint8Array(await response.arrayBuffer())
  };
};

export const downloadAccountFiles = async (files: ExportFile[]) => {
  const downloaded: Awaited<ReturnType<typeof downloadFile>>[] = [];
  let next = 0;

  const worker = async () => {
    while (next < files.length) {
      const index = next++;
      downloaded[index] = await downloadFile(files[index]);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(DOWNLOAD_CONCURRENCY, files.length) }, worker)
  );

  return downloaded;
};

export const destroyAccountStorage = async (
  { assets, folders }: { assets: StorageAsset[]; folders: string[] },
  log: FastifyBaseLogger
) => {
  await Promise.all([
    ...assets.map((asset) => destroyStorageAsset(asset, log)),
    ...folders.map((folder) => destroyStorageFolder(folder, log))
  ]);
};
