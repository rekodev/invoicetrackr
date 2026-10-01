import z from 'zod/v4';

export const invoicePaymentBodySchema = z.object({
  paymentDate: z.iso.date('validation.payment.date'),
  amount: z.string().regex(/^(?!0+(?:\.0{1,2})?$)\d{1,10}(?:\.\d{1,2})?$/, 'validation.payment.amount')
    .transform((value) => {
      const [whole, fraction = ''] = value.split('.');
      return `${BigInt(whole)}.${fraction.padEnd(2, '0')}`;
    }),
  bankReference: z.string().trim().max(255, 'validation.payment.reference').nullish(),
  notes: z.string().trim().max(2000, 'validation.payment.notes').nullish()
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
