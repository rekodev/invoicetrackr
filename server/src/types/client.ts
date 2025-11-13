import z from 'zod/v4';
import {
  invoicePartyBusinessTypeSchema,
  invoicePartyTypeSchema
} from './invoice';

export const clientSchema = z.object({
  id: z.number(),
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

export type ClientType = z.infer<typeof clientSchema>;
