import z from 'zod/v4';
import { DEFAULT_CURRENCY, currencySchema } from './common';

export const expenseCategorySchema = z.enum([
  'software',
  'equipment',
  'telecommunications',
  'office',
  'travel',
  'transport',
  'professional_services',
  'marketing',
  'education',
  'bank_fees',
  'insurance',
  'other'
]);

export const expensePaymentMethodSchema = z.enum([
  'bank_transfer',
  'card',
  'cash',
  'other'
]);

const moneyAmountSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, 'validation.expense.amount');

const nullableMoneyAmountSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, 'validation.expense.amount')
  .nullish()
  .or(z.literal(''));

const businessUsePercentageSchema = z
  .union([z.string().trim(), z.number()])
  .refine(
    (value) => /^\d+(\.\d{1,2})?$/.test(String(value)),
    'validation.expense.businessUsePercentage'
  )
  .refine((value) => {
    const numericValue = Number(value);

    return numericValue >= 0 && numericValue <= 100;
  }, 'validation.expense.businessUsePercentage')
  .default(100);

export const expenseBodySchema = z.object({
  id: z.coerce.number().optional(),
  expenseDate: z.iso.date('validation.expense.expenseDate'),
  paymentDate: z.iso
    .date('validation.expense.paymentDate')
    .nullish()
    .or(z.literal('')),
  supplier: z.string().trim().min(1, 'validation.expense.supplier').max(255),
  documentNumber: z.string().trim().max(255).nullish(),
  description: z
    .string()
    .trim()
    .min(1, 'validation.expense.description')
    .max(1000),
  category: expenseCategorySchema,
  currency: currencySchema.default(DEFAULT_CURRENCY),
  totalAmount: moneyAmountSchema,
  eurAmount: moneyAmountSchema.optional(),
  vatAmount: nullableMoneyAmountSchema,
  businessUsePercentage: businessUsePercentageSchema,
  deductibleAmount: moneyAmountSchema.optional(),
  paymentMethod: expensePaymentMethodSchema.nullish(),
  notes: z.string().trim().max(2000).nullish(),
  attachmentCount: z.number().optional(),
  deletedAt: z.string().nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish()
});

export const expenseAttachmentSchema = z.object({
  id: z.number(),
  expenseId: z.number(),
  storageProvider: z.string(),
  resourceType: z.string(),
  originalFileName: z.string(),
  sanitizedFileName: z.string(),
  mimeType: z.string(),
  fileSize: z.number(),
  checksum: z.string(),
  malwareScanStatus: z.string(),
  uploadedAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
  previewUrl: z.string().optional(),
  downloadUrl: z.string().optional()
});

export const expenseAttachmentParamsSchema = z.object({
  userId: z.string(),
  expenseId: z.string(),
  attachmentId: z.string()
});

export const expenseParamsSchema = z.object({
  userId: z.string(),
  expenseId: z.string()
});

export type ExpenseCategory = z.infer<typeof expenseCategorySchema>;
export type ExpensePaymentMethod = z.infer<typeof expensePaymentMethodSchema>;
export type ExpenseInput = z.input<typeof expenseBodySchema>;
export type ExpenseBody = z.infer<typeof expenseBodySchema>;
export type Expense = ExpenseBody;
export type ExpenseAttachment = z.infer<typeof expenseAttachmentSchema>;
