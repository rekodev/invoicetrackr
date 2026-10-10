import z from 'zod/v4';

import { yearSchema } from './common';
import { moneySchema } from './finance';

const isoDateSchema = z.iso.date('validation.taxProfile.date');

export const taxExpenseMethodSchema = z.enum(['actual', 'thirty_percent']);

export const taxEstimateQuerySchema = z.object({ year: yearSchema });

export const taxProfileParamsSchema = z.object({
  userId: z.string(),
  year: yearSchema
});

export const taxProfileBodySchema = z
  .object({
    expenseMethod: taxExpenseMethodSchema,
    hasEmploymentPsdCoverage: z.boolean(),
    hasAdditionalPensionAccumulation: z.boolean(),
    activityStartDate: isoDateSchema.nullish(),
    activityEndDate: isoDateSchema.nullish(),
    otherDeclaredIncome: z
      .string()
      .regex(/^\d+(?:\.\d{1,2})?$/, 'validation.taxProfile.otherIncome')
  })
  .refine(
    ({ activityStartDate, activityEndDate }) =>
      !activityStartDate ||
      !activityEndDate ||
      activityStartDate <= activityEndDate,
    {
      path: ['activityEndDate'],
      message: 'validation.taxProfile.activityDateRange'
    }
  );

export const taxProfileSchema = z.object({
  expenseMethod: taxExpenseMethodSchema,
  hasEmploymentPsdCoverage: z.boolean(),
  hasAdditionalPensionAccumulation: z.boolean(),
  activityStartDate: z.string().nullable(),
  activityEndDate: z.string().nullable(),
  otherDeclaredIncome: moneySchema
});

export const taxMethodEstimateSchema = z.object({
  method: taxExpenseMethodSchema,
  income: moneySchema,
  deductions: moneySchema,
  contributionBase: moneySchema,
  vsd: moneySchema,
  psd: moneySchema,
  psdMinimumApplied: z.boolean(),
  gpmProfit: moneySchema,
  gpmBeforeCredit: moneySchema,
  gpmCredit: moneySchema,
  gpm: moneySchema,
  usesCombinedIncomeBands: z.boolean(),
  total: moneySchema,
  effectiveRate: z.string()
});

export const taxRulesSummarySchema = z.object({
  version: z.string(),
  sources: z.array(z.object({ label: z.string(), url: z.string() }))
});

const taxEstimateBaseSchema = z.object({
  year: z.number().int(),
  supportedYears: z.array(z.number().int())
});

export const getTaxEstimateResponseSchema = z.discriminatedUnion('status', [
  taxEstimateBaseSchema.extend({ status: z.literal('unsupported_year') }),
  taxEstimateBaseSchema.extend({ status: z.literal('needs_profile') }),
  taxEstimateBaseSchema.extend({
    status: z.literal('ready'),
    profile: taxProfileSchema,
    activeMonths: z.number().int(),
    methods: z.object({
      actual: taxMethodEstimateSchema,
      thirtyPercent: taxMethodEstimateSchema
    }),
    lowerMethod: taxExpenseMethodSchema.nullable(),
    rules: taxRulesSummarySchema
  })
]);

export const saveTaxProfileResponseSchema = z.object({ message: z.string() });

export type TaxExpenseMethod = z.infer<typeof taxExpenseMethodSchema>;
export type TaxEstimateQuery = z.infer<typeof taxEstimateQuerySchema>;
export type TaxProfileBody = z.infer<typeof taxProfileBodySchema>;
export type TaxProfile = z.infer<typeof taxProfileSchema>;
export type TaxMethodEstimate = z.infer<typeof taxMethodEstimateSchema>;
export type TaxRulesSummary = z.infer<typeof taxRulesSummarySchema>;
export type TaxEstimateResponse = z.infer<typeof getTaxEstimateResponseSchema>;
export type SaveTaxProfileResponse = z.infer<typeof saveTaxProfileResponseSchema>;
