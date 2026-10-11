import z from 'zod/v4';

import { yearSchema } from './common';
import { moneySchema } from './finance';

export const dashboardSummaryQuerySchema = z.object({
  year: yearSchema.optional()
});

export const dashboardTotalsSchema = z.object({
  receivedIncome: moneySchema,
  invoiced: moneySchema,
  outstanding: moneySchema,
  overdue: moneySchema,
  expenses: moneySchema,
  deductibleExpenses: moneySchema
});

export const dashboardMonthSchema = z.object({
  month: z.number().int().min(1).max(12),
  receivedIncome: moneySchema,
  expenses: moneySchema,
  deductibleExpenses: moneySchema
});

export const dashboardOverdueInvoiceSchema = z.object({
  id: z.number(),
  invoiceId: z.string().nullable(),
  clientName: z.string(),
  clientEmail: z.string().nullable(),
  totalAmount: moneySchema,
  outstandingAmount: moneySchema,
  dueDate: z.string(),
  daysOverdue: z.number().int()
});

export const dashboardAttentionSchema = z.object({
  draftCount: z.number().int(),
  expensesMissingDocuments: z.number().int(),
  overdueWithoutEmail: z.number().int()
});

export const getDashboardSummaryResponseSchema = z.object({
  year: z.number().int(),
  totals: dashboardTotalsSchema,
  monthly: z.array(dashboardMonthSchema),
  overdueInvoices: z.array(dashboardOverdueInvoiceSchema),
  overdueCount: z.number().int(),
  attention: dashboardAttentionSchema
});

export type DashboardSummaryQuery = z.infer<typeof dashboardSummaryQuerySchema>;
export type DashboardTotals = z.infer<typeof dashboardTotalsSchema>;
export type DashboardMonth = z.infer<typeof dashboardMonthSchema>;
export type DashboardOverdueInvoice = z.infer<
  typeof dashboardOverdueInvoiceSchema
>;
export type DashboardAttention = z.infer<typeof dashboardAttentionSchema>;
export type DashboardSummaryResponse = z.infer<
  typeof getDashboardSummaryResponseSchema
>;
