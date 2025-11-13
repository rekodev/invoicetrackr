import z from 'zod/v4';
import { bankAccountSchema } from './banking-information';

export const invoiceServiceSchema = z.object({
  id: z.number().optional(),
  description: z
    .string()
    .min(1, 'validation.invoice.services.description')
    .max(200),
  unit: z.string().min(1, 'validation.invoice.services.unit').max(20),
  quantity: z.coerce
    .number()
    .min(0.0001, 'validation.invoice.services.quantity')
    .max(10000),
  amount: z.coerce
    .number()
    .min(0.01, 'validation.invoice.services.amount')
    .max(1000000)
});

export const invoiceStatusSchema = z.enum(['paid', 'pending', 'canceled'], {
  error: 'validation.invoice.status'
});

export const invoicePartyBusinessTypeSchema = z.enum(
  ['business', 'individual'],
  {
    error: 'validation.invoice.businessType'
  }
);

export const invoicePartyTypeSchema = z.enum(['sender', 'receiver'], {
  error: 'validation.invoice.partyType'
});

export const invoiceSchema = z
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
    sender: z.object(
      {
        type: invoicePartyTypeSchema,
        name: z.string().min(1, 'validation.invoice.sender.name'),
        businessType: invoicePartyBusinessTypeSchema,
        businessNumber: z
          .string()
          .min(1, 'validation.invoice.sender.businessNumber'),
        address: z.string().min(1, 'validation.invoice.sender.address'),
        email: z.email('validation.invoice.sender.email').optional()
      },
      { error: 'validation.invoice.sender.required' }
    ),
    senderSignature: z.any().optional(),
    receiver: z.object(
      {
        id: z.number().optional(),
        type: invoicePartyTypeSchema,
        name: z.string().min(1, 'validation.invoice.receiver.name'),
        businessType: invoicePartyBusinessTypeSchema,
        businessNumber: z
          .string()
          .min(1, 'validation.invoice.receiver.businessNumber'),
        address: z.string().min(1, 'validation.invoice.receiver.address'),
        email: z.email('validation.invoice.receiver.email').optional()
      },
      { error: 'validation.invoice.receiver.required' }
    ),
    totalAmount: z.coerce.number('validation.invoice.totalAmount'),
    status: invoiceStatusSchema,
    services: z
      .array(invoiceServiceSchema)
      .min(1, 'validation.invoice.services.required')
      .max(100),
    bankingInformation: bankAccountSchema
  })
  .refine(
    (data) => new Date(data.dueDate).getTime() >= new Date(data.date).getTime(),
    {
      error: 'validation.invoice.dueDateAfterDate',
      path: ['dueDate']
    }
  );

export type InvoiceType = z.infer<typeof invoiceSchema>;
export type InvoiceStatusType = z.infer<typeof invoiceStatusSchema>;
export type InvoiceServiceType = z.infer<typeof invoiceServiceSchema>;
export type InvoicePartyBusinessType = z.infer<
  typeof invoicePartyBusinessTypeSchema
>;
export type InvoicePartyType = z.infer<typeof invoicePartyTypeSchema>;
