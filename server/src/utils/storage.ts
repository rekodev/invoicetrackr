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

export const attachmentAsset = (attachment: StoredAttachment): StorageAsset => ({
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
