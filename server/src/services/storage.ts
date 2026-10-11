import { v2 as cloudinary } from 'cloudinary';
import type { FastifyBaseLogger } from 'fastify';

import type { StorageAsset } from '../utils/storage';

const DOWNLOAD_LINK_TTL_SECONDS = 300;

export const signedDownloadUrl = (asset: StorageAsset, format: string) =>
  cloudinary.utils.private_download_url(asset.publicId, format, {
    expires_at: Math.floor(Date.now() / 1000) + DOWNLOAD_LINK_TTL_SECONDS,
    resource_type: asset.resourceType,
    type: asset.type,
    attachment: true
  });

// Database mutations are committed before storage cleanup. A cleanup error must
// not invite a retry of an already successful mutation.
export const destroyStorageAsset = async (
  { publicId, resourceType, type }: StorageAsset,
  log: FastifyBaseLogger
) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      type
    });
    if (result.result !== 'ok' && result.result !== 'not found') {
      log.error({ publicId, result: result.result }, 'Storage cleanup failed');
    }
  } catch (error) {
    log.error({ err: error, publicId }, 'Storage cleanup failed');
  }
};

export const destroyStorageFolder = async (
  prefix: string,
  log: FastifyBaseLogger
) => {
  try {
    await cloudinary.api.delete_resources_by_prefix(prefix);
  } catch (error) {
    log.error({ err: error, prefix }, 'Storage cleanup failed');
  }
};
