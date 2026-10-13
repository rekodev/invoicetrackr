import z from 'zod/v4';

export const SUPPORTED_CURRENCIES = ['eur'] as const;

export const currencySchema = z.enum(SUPPORTED_CURRENCIES);

export type Currency = z.infer<typeof currencySchema>;

export const DEFAULT_CURRENCY: Currency = 'eur';

export const yearSchema = z.coerce.number().int().min(2000).max(2100);

export const passwordSchema = z
  .string()
  .min(8, 'validation.password.tooShort')
  .max(100, 'validation.password.tooLong')
  .regex(/[A-Z]/, 'validation.password.requireUppercase')
  .regex(/[a-z]/, 'validation.password.requireLowercase')
  .regex(/[0-9]/, 'validation.password.requireNumber');

export const loginPasswordSchema = z
  .string()
  .min(1, 'validation.password.required');

export const currentPasswordSchema = z
  .string()
  .min(1, 'validation.password.currentRequired');

export const analyticsConsentStatusSchema = z.enum(['accepted', 'declined']);

export type AnalyticsConsentStatus = z.infer<
  typeof analyticsConsentStatusSchema
>;

export const languageSchema = z.enum(['lt', 'en']);

export type Language = z.infer<typeof languageSchema>;

export const isoDateQuerySchema = z.iso.date();

export const DEFAULT_PAGE_SIZE = 10;

export const pageSizeQuerySchema = z.coerce.number().int().min(1).max(50);

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: pageSizeQuerySchema.default(DEFAULT_PAGE_SIZE)
});

export const paginationSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  total: z.number()
});

export type Pagination = z.infer<typeof paginationSchema>;
