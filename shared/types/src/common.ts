import z from 'zod/v4';

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
