import z from 'zod/v4';
import {
  invoicePartyBusinessTypeSchema,
  invoicePartyTypeSchema
} from './invoice';
import { passwordSchema, stripeSubscriptionStatusSchema } from './common';

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
  stripeCustomerId: z.string().nullish(),
  stripeSubscriptionId: z.string().nullish(),
  subscriptionStatus: stripeSubscriptionStatusSchema.nullish(),
  onboardingCompletedAt: z.string().nullish(),
  trialStartedAt: z.string().nullish(),
  trialEndsAt: z.string().nullish(),
  subscriptionGraceEndsAt: z.string().nullish(),
  subscriptionCurrentPeriodEndsAt: z.string().nullish(),
  subscriptionCancelAt: z.string().nullish()
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

// Types
export type UserBody = z.infer<typeof userBodySchema>;
export type User = UserBody;
export type UserWithPassword = UserBody;
export type ResetPasswordTokenGet = z.infer<typeof resetPasswordTokenGetSchema>;
export type ResetPasswordToken = ResetPasswordTokenGet;
export type VerifyEmailResponse = z.infer<typeof verifyEmailResponseSchema>;
export type OAuthUserBody = z.infer<typeof oauthUserBodySchema>;
