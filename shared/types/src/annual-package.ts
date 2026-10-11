import z from 'zod/v4';

import { yearSchema } from './common';
import { moneySchema } from './finance';
import { journalTotalsSchema } from './journal';
import { taxExpenseMethodSchema } from './tax';

export const annualPackageQuerySchema = z.object({ year: yearSchema });

export const annualPackageWarningCodeSchema = z.enum([
  'year_in_progress',
  'missing_tax_profile',
  'unsupported_tax_year',
  'missing_owner_details',
  'draft_invoices',
  'outstanding_invoices',
  'expenses_missing_documents'
]);

export const annualPackageWarningSchema = z.object({
  code: annualPackageWarningCodeSchema,
  severity: z.enum(['blocking', 'recommendation']),
  count: z.number().int().optional()
});

export const annualPackageSummarySchema = journalTotalsSchema.extend({
  invoiced: moneySchema,
  outstanding: moneySchema,
  expenseMethod: taxExpenseMethodSchema.nullable(),
  taxTotal: moneySchema.nullable()
});

export const getAnnualPackageResponseSchema = z.object({
  year: z.number().int(),
  asOf: z.string(),
  isComplete: z.boolean(),
  summary: annualPackageSummarySchema,
  warnings: z.array(annualPackageWarningSchema)
});

export type AnnualPackageQuery = z.infer<typeof annualPackageQuerySchema>;
export type AnnualPackageWarningCode = z.infer<
  typeof annualPackageWarningCodeSchema
>;
export type AnnualPackageWarning = z.infer<typeof annualPackageWarningSchema>;
export type AnnualPackageSummary = z.infer<typeof annualPackageSummarySchema>;
export type AnnualPackageResponse = z.infer<
  typeof getAnnualPackageResponseSchema
>;
