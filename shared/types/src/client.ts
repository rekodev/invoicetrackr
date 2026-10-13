import z from 'zod/v4';
import { pageSizeQuerySchema } from './common';
import {
  invoicePartyBusinessTypeSchema,
  invoicePartyTypeSchema
} from './invoice';

export const clientBodySchema = z.object({
  id: z.coerce.number().optional(),
  type: invoicePartyTypeSchema,
  name: z
    .string()
    .trim()
    .min(1, 'validation.client.name')
    .max(255, 'validation.client.nameMax'),
  businessType: invoicePartyBusinessTypeSchema,
  businessNumber: z
    .string()
    .trim()
    .min(1, 'validation.client.businessNumber')
    .max(255, 'validation.client.businessNumberMax'),
  vatNumber: z
    .string()
    .trim()
    .max(255, 'validation.client.vatNumberMax')
    .nullish(),
  address: z
    .string()
    .trim()
    .min(1, 'validation.client.address')
    .max(1000, 'validation.client.addressMax'),
  email: z
    .string()
    .trim()
    .max(255, 'validation.client.email')
    .pipe(z.literal('').or(z.email('validation.client.email')))
    .optional(),
  archivedAt: z.string().nullish()
});

export const clientMutationBodySchema = clientBodySchema
  .omit({ archivedAt: true })
  .extend({ duplicateAcknowledged: z.boolean().optional() });

export const clientListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: pageSizeQuerySchema.optional(),
  q: z.string().trim().max(100).optional(),
  businessType: invoicePartyBusinessTypeSchema.optional()
});

// Types
export type ClientListQuery = z.infer<typeof clientListQuerySchema>;
export type ClientBody = z.infer<typeof clientBodySchema>;
export type ClientMutationBody = z.infer<typeof clientMutationBodySchema>;
export type Client = ClientBody;
