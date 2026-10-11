import { v2 as cloudinary } from 'cloudinary';
import type { FastifyBaseLogger } from 'fastify';

import type { ExportFile, StorageAsset } from '../utils/account-data';

const DOWNLOAD_LINK_TTL_SECONDS = 300;

const fileUrl = (file: ExportFile) =>
  'url' in file
    ? file.url
    : cloudinary.utils.private_download_url(file.asset.publicId, file.format, {
        expires_at: Math.floor(Date.now() / 1000) + DOWNLOAD_LINK_TTL_SECONDS,
        resource_type: file.asset.resourceType,
        type: file.asset.type,
        attachment: true
      });

export const downloadAccountFiles = (files: ExportFile[]) =>
  Promise.all(
    files.map(async (file) => {
      const response = await fetch(fileUrl(file));

      if (!response.ok) {
        throw new Error(`Account export download of ${file.path} failed: ${response.status}`);
      }

      return {
        path: file.path,
        content: new Uint8Array(await response.arrayBuffer())
      };
    })
  );

export const destroyStorageAssets = async (
  assets: StorageAsset[],
  log: FastifyBaseLogger
) => {
  await Promise.all(
    assets.map(async ({ publicId, resourceType, type }) => {
      try {
        const result = await cloudinary.uploader.destroy(publicId, {
          resource_type: resourceType,
          type
        });

        if (result.result !== 'ok' && result.result !== 'not found') {
          log.error({ publicId, result: result.result }, 'Account storage cleanup failed');
        }
      } catch (error) {
        log.error({ err: error, publicId }, 'Account storage cleanup failed');
      }
    })
  );
};
