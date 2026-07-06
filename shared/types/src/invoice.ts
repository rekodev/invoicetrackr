import z from 'zod/v4';
import { bankAccountBodySchema } from './bank-account';

// Enums
export const invoiceStatusSchema = z.enum(['paid', 'pending', 'canceled'], {
  message: 'validation.invoice.status'
});

export const invoiceLifecycleStatusSchema = z.enum(
  ['draft', 'issued', 'voided'],
  {
    message: 'validation.invoice.lifecycleStatus'
  }
);

export const invoicePaymentModeSchema = z.enum(
  ['manual', 'disabled'],
  {
    message: 'validation.invoice.paymentMode'
  }
);

export const publicInvoiceResolvedPaymentModeSchema = z.enum([
  'manual',
  'disabled'
]);

export const invoicePartyBusinessTypeSchema = z.enum(
  ['business', 'individual'],
  {
    message: 'validation.invoice.businessType'
  }
);

export const invoicePartyTypeSchema = z.enum(['sender', 'receiver'], {
  message: 'validation.invoice.partyType'
});

export const invoiceNumberSeriesSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{2,8}$/, 'validation.invoice.invoiceSeries');

export const invoiceNumberSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{2,8}[0-9]{1,9}$/, 'validation.invoice.invoiceId');

export const invoiceServiceBodySchema = z.object({
  id: z.coerce.number().optional(),
  description: z
    .string()
    .min(1, 'validation.invoice.services.description')
    .max(200),
  unit: z.string().min(1, 'validation.invoice.services.unit').max(20),
  quantity: z.coerce
    .number('validation.invoice.services.quantity.number')
    .min(0.0001, 'validation.invoice.services.quantity.min')
    .max(10000, 'validation.invoice.services.quantity.max'),
  amount: z.coerce
    .number('validation.invoice.services.amount.number')
    .min(0.01, 'validation.invoice.services.amount.min')
    .max(10000000, 'validation.invoice.services.amount.max'),
  vatRate: z.coerce.number().min(0).max(100).optional(),
  vatExemptionReason: z.string().trim().max(255).nullish()
});

export const invoiceSenderBodySchema = z.object(
  {
    id: z.coerce.number().optional(),
    type: invoicePartyTypeSchema,
    name: z.string().min(1, 'validation.invoice.sender.name'),
    businessType: invoicePartyBusinessTypeSchema,
    businessNumber: z
      .string()
      .min(1, 'validation.invoice.sender.businessNumber'),
    vatNumber: z.string().nullish(),
    address: z.string().min(1, 'validation.invoice.sender.address'),
    email: z
      .email('validation.invoice.sender.email')
      .optional()
      .or(z.literal(''))
  },
  { message: 'validation.invoice.sender.required' }
);

export const invoiceReceiverBodySchema = z.object(
  {
    id: z.coerce.number().optional(),
    type: invoicePartyTypeSchema,
    name: z.string().min(1, 'validation.invoice.receiver.name'),
    businessType: invoicePartyBusinessTypeSchema,
    businessNumber: z
      .string()
      .min(1, 'validation.invoice.receiver.businessNumber'),
    vatNumber: z.string().nullish(),
    address: z.string().min(1, 'validation.invoice.receiver.address'),
    email: z
      .email('validation.invoice.receiver.email')
      .optional()
      .or(z.literal(''))
  },
  { message: 'validation.invoice.receiver.required' }
);

export const invoiceBodySchema = z
  .object({
    id: z.coerce.number().optional(),
    invoiceId: invoiceNumberSchema.optional().or(z.literal('')),
    invoiceSeries: invoiceNumberSeriesSchema.optional(),
    date: z.iso.date('validation.invoice.date'),
    dueDate: z.iso.date('validation.invoice.dueDate'),
    sender: invoiceSenderBodySchema,
    senderSignature: z.any().optional(),
    receiverSignature: z.string().nullish(),
    receiver: invoiceReceiverBodySchema,
    subtotalAmount: z.string().optional(),
    vatAmount: z.string().optional(),
    totalAmount: z.string({ message: 'validation.invoice.totalAmount' }),
    status: invoiceStatusSchema,
    lifecycleStatus: invoiceLifecycleStatusSchema.optional(),
    issuedAt: z.string().nullish(),
    paidAt: z.string().nullish(),
    voidedAt: z.string().nullish(),
    recipientSigningToken: z.string().nullish(),
    recipientSigningSentAt: z.string().nullish(),
    recipientSigningEmail: z.string().nullish(),
    recipientSigningCreatedAt: z.string().nullish(),
    recipientSigningExpiresAt: z.string().nullish(),
    recipientSigningRevokedAt: z.string().nullish(),
    recipientSigningRequestedAt: z.string().nullish(),
    recipientSignedAt: z.string().nullish(),
    publicInvoiceToken: z.string().nullish(),
    publicInvoiceSentAt: z.string().nullish(),
    publicInvoiceExpiresAt: z.string().nullish(),
    publicInvoiceRevokedAt: z.string().nullish(),
    paymentMode: invoicePaymentModeSchema.default('manual'),
    manualPaymentReference: z.string().trim().max(255).nullish(),
    services: z
      .array(invoiceServiceBodySchema)
      .min(1, 'validation.invoice.services.required')
      .max(100),
    bankingInformation: bankAccountBodySchema
  })
  .refine(
    (data) => new Date(data.dueDate).getTime() >= new Date(data.date).getTime(),
    {
      message: 'validation.invoice.dueDateAfterDate',
      path: ['dueDate']
    }
  );

export const publicInvoiceSigningSchema = z.object({
  token: z.string(),
  invoice: invoiceBodySchema,
  currency: z.string(),
  language: z.string(),
  preferredInvoiceLanguage: z.string().nullish()
});

export const publicInvoicePaymentSchema = z.object({
  configuredMode: invoicePaymentModeSchema,
  resolvedMode: publicInvoiceResolvedPaymentModeSchema,
  provider: z.null(),
  available: z.boolean(),
  manualReference: z.string().nullish()
});

export const publicInvoiceSchema = z.object({
  token: z.string(),
  invoice: invoiceBodySchema,
  currency: z.string(),
  language: z.string(),
  preferredInvoiceLanguage: z.string().nullish(),
  payment: publicInvoicePaymentSchema,
  signing: z.object({
    requested: z.boolean(),
    signed: z.boolean(),
    available: z.boolean()
  })
});

export const signInvoiceBodySchema = z.object({
  file: z.any()
});

const multipartBooleanSchema = z.preprocess(
  (value) => (value === 'true' ? true : value === 'false' ? false : value),
  z.boolean()
);

export const sendInvoiceEmailBodySchema = z.object({
  recipientEmail: z.email('validation.invoice.recipientEmail'),
  subject: z.string().min(1, 'validation.invoice.subject'),
  message: z.string().max(1000, 'validation.invoice.message').optional(),
  includePublicLink: multipartBooleanSchema.optional(),
  requestSignature: multipartBooleanSchema.optional(),
  file: z.any().nullish()
});

export const incomeJournalQuerySchema = z
  .object({
    from: z.iso.date(),
    to: z.iso.date()
  })
  .refine((data) => data.from <= data.to, {
    message: 'validation.invoice.incomeJournalDateRange',
    path: ['to']
  });

// Types
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;
export type InvoiceNumberSeries = z.infer<typeof invoiceNumberSeriesSchema>;
export type InvoiceLifecycleStatus = z.infer<
  typeof invoiceLifecycleStatusSchema
>;
export type InvoicePaymentMode = z.infer<typeof invoicePaymentModeSchema>;
export type PublicInvoiceResolvedPaymentMode = z.infer<
  typeof publicInvoiceResolvedPaymentModeSchema
>;
export type InvoicePartyBusinessType = z.infer<
  typeof invoicePartyBusinessTypeSchema
>;
export type InvoicePartyType = z.infer<typeof invoicePartyTypeSchema>;

export type InvoiceServiceBody = z.infer<typeof invoiceServiceBodySchema>;
export type InvoiceService = InvoiceServiceBody;

export type InvoiceSenderBody = z.infer<typeof invoiceSenderBodySchema>;
export type InvoiceReceiverBody = z.infer<typeof invoiceReceiverBodySchema>;
export type InvoicePartyBody = InvoiceSenderBody | InvoiceReceiverBody;
export type InvoiceParty = InvoicePartyBody;

export type InvoiceBody = z.infer<typeof invoiceBodySchema>;
export type PublicInvoiceSigning = z.infer<typeof publicInvoiceSigningSchema>;
export type PublicInvoice = z.infer<typeof publicInvoiceSchema>;
export type PublicInvoicePayment = z.infer<typeof publicInvoicePaymentSchema>;
export type IncomeJournalQuery = z.infer<typeof incomeJournalQuerySchema>;
