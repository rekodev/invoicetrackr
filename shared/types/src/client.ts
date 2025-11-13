import z from 'zod/v4';
import {
  invoicePartyBusinessTypeSchema,
  invoicePartyTypeSchema
} from './invoice';

export const clientBodySchema = z.object({
  id: z.number().optional(),
  type: invoicePartyTypeSchema,
  name: z.string().min(1, 'validation.client.name'),
  businessType: invoicePartyBusinessTypeSchema,
  businessNumber: z.string().min(1, 'validation.client.businessNumber'),
  address: z.string().min(1, 'validation.client.address'),
  email: z.email('validation.client.email').optional().or(z.literal(''))
});

// Types
export type ClientBody = z.infer<typeof clientBodySchema>;
export type Client = ClientBody;
