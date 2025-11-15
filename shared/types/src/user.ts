import z from 'zod/v4';
import {
  invoicePartyBusinessTypeSchema,
  invoicePartyTypeSchema
} from './invoice';
import { passwordSchema } from './common';

export const userBodySchema = z.object({
  id: z.number().optional(),
  type: invoicePartyTypeSchema,
  name: z.string().min(1, 'validation.user.name'),
  businessType: invoicePartyBusinessTypeSchema,
  businessNumber: z.string().min(1, 'validation.user.businessNumber'),
  address: z.string().min(1, 'validation.user.address'),
  email: z.email('validation.user.email').optional().or(z.literal('')),
  signature: z.string().optional(),
  selectedBankAccountId: z.number().optional(),
  password: passwordSchema.optional(),
  profilePictureUrl: z.string(),
  currency: z.string().min(1, 'validation.user.currency'),
  language: z.string().min(1, 'validation.user.language'),
  stripeCustomerId: z.string(),
  stripeSubscriptionId: z.string(),
  isSubscriptionActive: z.boolean().optional()
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
