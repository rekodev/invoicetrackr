import z from 'zod/v4';

export const expenseAttachmentSchema = z.object({
  id: z.number(),
  expenseId: z.number(),
  storageProvider: z.string(),
  resourceType: z.string(),
  originalFileName: z.string(),
  sanitizedFileName: z.string(),
  mimeType: z.string(),
  fileSize: z.number(),
  checksum: z.string(),
  malwareScanStatus: z.string(),
  uploadedAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
  previewUrl: z.string().optional(),
  downloadUrl: z.string().optional()
});

export const expenseAttachmentParamsSchema = z.object({
  userId: z.string(),
  expenseId: z.string(),
  attachmentId: z.string()
});

export const expenseParamsSchema = z.object({
  userId: z.string(),
  expenseId: z.string()
});

export type ExpenseAttachment = z.infer<typeof expenseAttachmentSchema>;
