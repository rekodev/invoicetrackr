import z from 'zod/v4';

import { moneySchema } from './finance';

const signedMoneySchema = z.string().regex(/^-?\d+(?:\.\d{1,2})?$/);

export const journalQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12).optional()
});

export const journalExportFormatSchema = z.enum(['csv', 'xlsx']);

export const journalExportQuerySchema = journalQuerySchema.extend({
  format: journalExportFormatSchema
});

const journalRowBaseSchema = z.object({
  date: z.string(),
  documentNumber: z.string().nullable(),
  counterparty: z.string(),
  description: z.string(),
  amount: moneySchema
});

export const journalIncomeRowSchema = journalRowBaseSchema.extend({
  kind: z.literal('income'),
  invoiceId: z.number(),
  paymentId: z.number(),
  counterpartyCode: z.string().nullable(),
  vatAmount: moneySchema,
  netAmount: moneySchema
});

export const journalExpenseRowSchema = journalRowBaseSchema.extend({
  kind: z.literal('expense'),
  expenseId: z.number(),
  totalEurAmount: moneySchema,
  businessUsePercentage: z.string()
});

export const journalRowSchema = z.discriminatedUnion('kind', [
  journalIncomeRowSchema,
  journalExpenseRowSchema
]);

export const journalTotalsSchema = z.object({
  income: moneySchema,
  incomeVat: moneySchema,
  incomeNet: moneySchema,
  expenses: moneySchema,
  net: signedMoneySchema
});

export const journalPeriodSchema = z.object({
  year: z.number().int(),
  month: z.number().int().nullable(),
  from: z.string(),
  to: z.string()
});

export const getJournalResponseSchema = z.object({
  period: journalPeriodSchema,
  rows: z.array(journalRowSchema),
  totals: journalTotalsSchema
});

export type JournalQuery = z.infer<typeof journalQuerySchema>;
export type JournalExportFormat = z.infer<typeof journalExportFormatSchema>;
export type JournalExportQuery = z.infer<typeof journalExportQuerySchema>;
export type JournalIncomeRow = z.infer<typeof journalIncomeRowSchema>;
export type JournalExpenseRow = z.infer<typeof journalExpenseRowSchema>;
export type JournalRow = z.infer<typeof journalRowSchema>;
export type JournalTotals = z.infer<typeof journalTotalsSchema>;
export type JournalPeriod = z.infer<typeof journalPeriodSchema>;
export type JournalResponse = z.infer<typeof getJournalResponseSchema>;
