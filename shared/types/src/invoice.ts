import z from 'zod/v4';

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

// Invoice Service Schemas
export const invoiceServiceGetSchema = z.object({
  id: z.number(),
  description: z.string(),
  unit: z.string(),
  quantity: z.number(),
  amount: z.number()
});

export const invoiceServiceBodySchema = z.object({
  id: z.number().optional(),
  description: z
    .string()
    .min(1, 'validation.invoice.services.description')
    .max(200),
  unit: z.string().min(1, 'validation.invoice.services.unit').max(20),
  quantity: z
    .number()
    .min(0.0001, 'validation.invoice.services.quantity')
    .max(10000),
  amount: z
    .number()
    .min(0.01, 'validation.invoice.services.amount')
    .max(1000000)
});

// Invoice Party (Sender/Receiver) Schemas
export const invoicePartyGetSchema = z.object({
  id: z.number().optional(),
  type: invoicePartyTypeSchema,
  name: z.string(),
  businessType: invoicePartyBusinessTypeSchema,
  businessNumber: z.string(),
  address: z.string(),
  email: z.email().optional()
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
    address: z.string().min(1, 'validation.invoice.sender.address'),
    email: z.email('validation.invoice.sender.email').optional(),
    signature: z.string().optional(),
    selectedBankAccountId: z.number().optional(),
    password: z.string().optional(),
    profilePictureUrl: z.string().optional(),
    currency: z.string().optional(),
    language: z.string().optional()
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
    address: z.string().min(1, 'validation.invoice.receiver.address'),
    email: z.email('validation.invoice.receiver.email').optional()
  },
  { message: 'validation.invoice.receiver.required' }
);

// Bank Account for Invoice
const invoiceBankAccountGetSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  accountNumber: z.string()
});

const invoiceBankAccountBodySchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'validation.bankAccount.name'),
  code: z.string().min(1, 'validation.bankAccount.code'),
  accountNumber: z.string().min(1, 'validation.bankAccount.accountNumber')
});

// Main Invoice Schemas
export const invoiceGetSchema = z.object({
  id: z.number(),
  invoiceId: z.string(),
  date: z.string(),
  dueDate: z.string(),
  sender: invoicePartyGetSchema,
  senderSignature: z.any().optional(),
  receiver: invoicePartyGetSchema,
  totalAmount: z.string(),
  status: invoiceStatusSchema,
  services: z.array(invoiceServiceGetSchema),
  bankingInformation: invoiceBankAccountGetSchema
});

export const invoiceBodySchema = z
  .object({
    id: z.number().optional(),
    invoiceId: z
      .string()
      .regex(
        /^[A-Za-z]{3}(0[0-9]{2}|[1-9][0-9]{2}|[1-9]0{2})$/,
        'validation.invoice.invoiceId'
      ),
    date: z.string(),
    dueDate: z.string(),
    sender: invoiceSenderBodySchema,
    senderSignature: z.any().optional(),
    receiver: invoiceReceiverBodySchema,
    totalAmount: z.string({ message: 'validation.invoice.totalAmount' }),
    status: invoiceStatusSchema,
    services: z
      .array(invoiceServiceBodySchema)
      .min(1, 'validation.invoice.services.required')
      .max(100),
    bankingInformation: invoiceBankAccountBodySchema
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

export type InvoiceServiceGet = z.infer<typeof invoiceServiceGetSchema>;
export type InvoiceServiceBody = z.infer<typeof invoiceServiceBodySchema>;
export type InvoiceService = InvoiceServiceGet;

export type InvoicePartyGet = z.infer<typeof invoicePartyGetSchema>;
export type InvoiceSenderBody = z.infer<typeof invoiceSenderBodySchema>;
export type InvoiceReceiverBody = z.infer<typeof invoiceReceiverBodySchema>;
export type InvoiceParty = InvoicePartyGet;

export type InvoiceGet = z.infer<typeof invoiceGetSchema>;
export type InvoiceBody = z.infer<typeof invoiceBodySchema>;
export type Invoice = InvoiceGet;
