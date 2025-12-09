import z from 'zod/v4';
import {
  invoicePartyBusinessTypeSchema,
  invoicePartyTypeSchema
} from './invoice';
import { passwordSchema } from './common';

export const userBodySchema = z.object({
  id: z.number().optional(),
  type: invoicePartyTypeSchema,
  name: z.string(),
  businessType: invoicePartyBusinessTypeSchema,
  businessNumber: z.string(),
  vatNumber: z.string().nullish(),
  address: z.string(),
  email: z.email('validation.user.email').optional().or(z.literal('')),
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
  subscriptionStatus: z
    .enum([
      'active',
      'past_due',
      'canceled',
      'incomplete',
      'incomplete_expired',
      'trialing',
      'unpaid',
      'paused'
    ])
    .nullish()
});

// Reset Password Token Schema
export const resetPasswordTokenGetSchema = z.object({
  id: z.number(),
  userId: z.number(),
  token: z.string(),
  expiresAt: z.string(),
  createdAt: z.string()
});

// Types
export type UserBody = z.infer<typeof userBodySchema>;
export type User = UserBody;
export type UserWithPassword = UserBody;
export type ResetPasswordTokenGet = z.infer<typeof resetPasswordTokenGetSchema>;
export type ResetPasswordToken = ResetPasswordTokenGet;
