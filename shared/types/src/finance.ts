import z from 'zod/v4';

export const moneySchema = z.string().regex(/^\d+(?:\.\d{1,2})?$/);
const isoCurrencySchema = z.string().length(3).transform((value) => value.toLowerCase());

export const businessProfileSchema = z.object({
  id: z.number().optional(),
  userId: z.number(),
  legalName: z.string(),
  activityCertificateNumber: z.string(),
  address: z.string(),
  invoiceEmail: z.email().or(z.literal('')),
  phone: z.string().nullish(),
  vatNumber: z.string().nullish(),
  signatureUrl: z.string(),
  logoUrl: z.string(),
  selectedBankAccountId: z.number().nullish(),
  currency: z.literal('eur'),
  preferredInvoiceLanguage: z.enum(['lt', 'en']).nullish(),
  isVatPayer: z.boolean(),
  defaultInvoiceVatMode: z.enum(['no_vat', 'standard_21', 'zero', 'manual']),
  defaultInvoiceSeries: z.string(),
  defaultPaymentTermsDays: z.union([z.literal(7), z.literal(14), z.literal(30)]),
  defaultInvoiceIncludeLogo: z.boolean(),
  onboardingCompletedAt: z.string().nullish()
});

export const paymentSchema = z.object({
  id: z.number().optional(),
  userId: z.number(),
  paymentDate: z.string(),
  amount: moneySchema,
  currency: isoCurrencySchema,
  eurAmount: moneySchema,
  method: z.enum(['bank_transfer', 'cash', 'other']),
  bankReference: z.string().nullish(),
  notes: z.string().nullish()
});

export const paymentAllocationSchema = z.object({
  id: z.number().optional(),
  userId: z.number(),
  paymentId: z.number(),
  invoiceId: z.number(),
  amount: moneySchema
});

export type BusinessProfile = z.infer<typeof businessProfileSchema>;
export type Payment = z.infer<typeof paymentSchema>;
export type PaymentAllocation = z.infer<typeof paymentAllocationSchema>;
