import { z } from 'zod';

import { InvoicePartyBusinessType } from './invoice';

export const clientSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  type: z.literal('receiver'),
  businessType: z.union([z.literal('individual'), z.literal('business')]),
  businessNumber: z.string(),
  address: z.string(),
  email: z.string(),
});

export type ClientModel = z.infer<typeof clientSchema>;

export type ClientFormData = Omit<ClientModel, 'id' | 'businessType'> & {
  businessType: InvoicePartyBusinessType | null;
};
