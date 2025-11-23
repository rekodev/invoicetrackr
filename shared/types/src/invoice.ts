import z from 'zod/v4';
import { bankAccountBodySchema } from './bank-account';

// Enums
export const invoiceStatusSchema = z.enum(['paid', 'pending', 'canceled'], {
  message: 'validation.invoice.status'
});

export const invoicePartyBusinessTypeSchema = z.enum(
  ['business', 'individual'],
  {
    message: 'validation.invoice.businessType'
  }
);

export const invoicePartyTypeSchema = z.enum(['sender', 'receiver'], {
  message: 'validation.invoice.partyType'
});

export const invoiceServiceBodySchema = z.object({
  id: z.number().optional(),
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
    .max(10000000, 'validation.invoice.services.amount.max')
});

export const invoiceSenderBodySchema = z.object(
  {
    id: z.number().optional(),
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
    id: z.number().optional(),
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
    id: z.number().optional(),
    invoiceId: z
      .string()
      .regex(
        /^[A-Za-z]{3}(0[0-9]{2}|[1-9][0-9]{2}|[1-9]0{2})$/,
        'validation.invoice.invoiceId'
      ),
    date: z.iso.date('validation.invoice.date'),
    dueDate: z.iso.date('validation.invoice.dueDate'),
    sender: invoiceSenderBodySchema,
    senderSignature: z.any().optional(),
    receiver: invoiceReceiverBodySchema,
    totalAmount: z.string({ message: 'validation.invoice.totalAmount' }),
    status: invoiceStatusSchema,
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

// Types
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;
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
