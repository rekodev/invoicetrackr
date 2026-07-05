import z from 'zod/v4';
import {
  invoiceNumberSeriesSchema,
  invoicePartyBusinessTypeSchema,
  invoicePartyTypeSchema
} from './invoice';
import {
  analyticsConsentStatusSchema,
  passwordSchema,
  stripeSubscriptionStatusSchema
} from './common';

export const userBodySchema = z.object({
  id: z.number().optional(),
  type: invoicePartyTypeSchema,
  name: z.string(),
  businessType: invoicePartyBusinessTypeSchema,
  businessNumber: z.string(),
  vatNumber: z.string().nullish(),
  address: z.string(),
  email: z.email('validation.user.email').optional().or(z.literal('')),
  emailVerifiedAt: z.string().nullish(),
  signature: z.string().optional(),
  selectedBankAccountId: z.number().nullish(),
  password: passwordSchema.optional(),
  profilePictureUrl: z.string(),
  currency: z.string().min(1, 'validation.user.currency'),
  language: z.string().min(1, 'validation.user.language'),
  preferredInvoiceLanguage: z.nullish(
    z.string().min(1, 'validation.user.preferredInvoiceLanguage')
  ),
  isVatPayer: z.boolean().default(false),
  defaultInvoiceVatMode: z
    .enum(['no_vat', 'standard_21', 'zero', 'manual'], {
      message: 'validation.user.defaultInvoiceVatMode'
    })
    .default('no_vat'),
  defaultInvoiceSeries: invoiceNumberSeriesSchema.default('SF'),
  defaultPaymentTermsDays: z
    .union([z.literal(7), z.literal(14), z.literal(30)])
    .default(30),
  stripeCustomerId: z.string().nullish(),
  stripeSubscriptionId: z.string().nullish(),
  subscriptionStatus: stripeSubscriptionStatusSchema.nullish(),
  onboardingCompletedAt: z.string().nullish(),
  trialStartedAt: z.string().nullish(),
  trialEndsAt: z.string().nullish(),
  subscriptionGraceEndsAt: z.string().nullish(),
  subscriptionCurrentPeriodEndsAt: z.string().nullish(),
  subscriptionCancelAt: z.string().nullish(),
  analyticsConsentStatus: analyticsConsentStatusSchema.nullish(),
  analyticsConsentUpdatedAt: z.string().nullish()
});

// Reset Password Token Schema
export const resetPasswordTokenGetSchema = z.object({
  id: z.number(),
  userId: z.number(),
  token: z.string(),
  expiresAt: z.string(),
  createdAt: z.string()
});

export const verifyEmailResponseSchema = z.object({
  status: z.enum(['verified', 'already_verified']),
  emailVerifiedAt: z.string().nullish(),
  message: z.string()
});

export const oauthUserBodySchema = z.object({
  email: z.email('validation.user.email'),
  name: z.string().optional(),
  image: z.string().optional(),
  provider: z.literal('google'),
  emailVerified: z.boolean()
});

export const accountSettingsBodySchema = userBodySchema
  .pick({
    currency: true,
    language: true,
    preferredInvoiceLanguage: true,
    isVatPayer: true,
    defaultInvoiceVatMode: true,
    defaultInvoiceSeries: true,
    defaultPaymentTermsDays: true
  })
  .extend({
    preferredInvoiceLanguage: z.string().max(2).min(2).optional(),
    currency: z.string().max(3).min(3),
    language: z.string().max(2).min(2)
  });

// Types
export type UserBody = z.infer<typeof userBodySchema>;
export type User = UserBody;
export type AccountSettingsBody = z.infer<typeof accountSettingsBodySchema>;
export type DefaultInvoiceVatMode = UserBody['defaultInvoiceVatMode'];
export type UserWithPassword = UserBody;
export type ResetPasswordTokenGet = z.infer<typeof resetPasswordTokenGetSchema>;
export type ResetPasswordToken = ResetPasswordTokenGet;
export type VerifyEmailResponse = z.infer<typeof verifyEmailResponseSchema>;
export type OAuthUserBody = z.infer<typeof oauthUserBodySchema>;
