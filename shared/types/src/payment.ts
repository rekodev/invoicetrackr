import z from 'zod/v4';

export const invoicePaymentBodySchema = z.object({
  paymentDate: z.iso.date(),
  amount: z.string().regex(/^(?!0+\.00$)\d{1,10}\.\d{2}$/),
  bankReference: z.string().trim().max(255).nullish(),
  notes: z.string().trim().max(2000).nullish()
});

export const invoicePaymentSchema = invoicePaymentBodySchema.extend({
  id: z.number(),
  createdAt: z.string()
});

export const invoicePaymentSummarySchema = z.object({
  paidAmount: z.string(),
  outstandingAmount: z.string()
});

export type InvoicePaymentBody = z.infer<typeof invoicePaymentBodySchema>;
export type InvoicePayment = z.infer<typeof invoicePaymentSchema>;
