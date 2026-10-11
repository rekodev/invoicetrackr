import z from 'zod/v4';

import { yearSchema } from './common';
import { moneySchema } from './finance';
import { taxExpenseMethodSchema } from './tax';

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

const dashboardSafeToSpendBaseSchema = z.object({
  receivedIncome: moneySchema,
  vatCollected: moneySchema,
  expenses: moneySchema
});

export const dashboardSafeToSpendSchema = z.discriminatedUnion('status', [
  dashboardSafeToSpendBaseSchema.extend({ status: z.literal('unsupported_year') }),
  dashboardSafeToSpendBaseSchema.extend({ status: z.literal('needs_profile') }),
  dashboardSafeToSpendBaseSchema.extend({
    status: z.literal('ready'),
    expenseMethod: taxExpenseMethodSchema,
    taxReserve: moneySchema,
    safeToSpend: moneySchema,
    shortfall: moneySchema
  })
]);

export const getDashboardSummaryResponseSchema = z.object({
  year: z.number().int(),
  totals: dashboardTotalsSchema,
  monthly: z.array(dashboardMonthSchema),
  overdueInvoices: z.array(dashboardOverdueInvoiceSchema),
  overdueCount: z.number().int(),
  attention: dashboardAttentionSchema,
  safeToSpend: dashboardSafeToSpendSchema
});

export type DashboardSummaryQuery = z.infer<typeof dashboardSummaryQuerySchema>;
export type DashboardTotals = z.infer<typeof dashboardTotalsSchema>;
export type DashboardMonth = z.infer<typeof dashboardMonthSchema>;
export type DashboardOverdueInvoice = z.infer<
  typeof dashboardOverdueInvoiceSchema
>;
export type DashboardSafeToSpend = z.infer<typeof dashboardSafeToSpendSchema>;
export type DashboardAttention = z.infer<typeof dashboardAttentionSchema>;
export type DashboardSummaryResponse = z.infer<
  typeof getDashboardSummaryResponseSchema
>;
