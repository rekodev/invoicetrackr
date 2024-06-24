import { z } from 'zod';

import { clientSchema } from './client';
import { userSchema } from './user';

export const invoiceStatusSchema = z.union([
  z.literal('paid'),
  z.literal('pending'),
  z.literal('canceled'),
]);

export const invoicePartyBusinessSchema = z.union([
  z.literal('business'),
  z.literal('individual'),
]);

export const invoiceServiceSchema = z.object({
  description: z.string(),
  amount: z.number(),
  quantity: z.number(),
  unit: z.string(),
});

export const invoiceSchema = z.object({
  invoiceId: z.string().regex(new RegExp('^[A-Za-z]{3}(?!000)\\d{3}$')),
  status: z.string(),
  date: z.string(),
  dueDate: z.string(),
  sender: userSchema,
  senderSignature: z.string().or(z.instanceof(File)),
  receiver: clientSchema,
  services: z.array(invoiceServiceSchema),
  totalAmount: z.number(),
});

export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;
export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type InvoiceModel = z.infer<typeof invoiceSchema> & {
  id: number;
  services: Array<{ id: number }>;
};
export type InvoiceService = z.infer<typeof invoiceServiceSchema>;
export type InvoicePartyBusinessType = z.infer<
  typeof invoicePartyBusinessSchema
>;
