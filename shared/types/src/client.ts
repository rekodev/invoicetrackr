import z from 'zod/v4';
import {
  invoicePartyBusinessTypeSchema,
  invoicePartyTypeSchema
} from './invoice';

export const clientGetSchema = z.object({
  id: z.number(),
  type: invoicePartyTypeSchema,
  name: z.string(),
  businessType: invoicePartyBusinessTypeSchema,
  businessNumber: z.string(),
  address: z.string(),
  email: z.string()
});

export const clientBodySchema = z.object({
  id: z.number().optional(),
  type: invoicePartyTypeSchema,
  name: z.string().min(1, 'validation.client.name'),
  businessType: invoicePartyBusinessTypeSchema,
  businessNumber: z.string().min(1, 'validation.client.businessNumber'),
  address: z.string().min(1, 'validation.client.address'),
  email: z.union([
    z.string().max(0),
    z.string().min(1).email('validation.client.email')
  ])
});

// Types
export type ClientGet = z.infer<typeof clientGetSchema>;
export type ClientBody = z.infer<typeof clientBodySchema>;
export type Client = ClientGet;
