import z from 'zod/v4';
import {
  invoicePartyBusinessTypeSchema,
  invoicePartyTypeSchema
} from './invoice';
import { passwordSchema } from './common';

export const userSchema = z.object({
  id: z.number().optional(),
  type: invoicePartyTypeSchema,
  name: z.string().min(1, 'validation.user.name'),
  businessType: invoicePartyBusinessTypeSchema,
  businessNumber: z.string().min(1, 'validation.user.businessNumber'),
  address: z.string().min(1, 'validation.user.address'),
  email: z.string().email('validation.user.email').optional(),
  signature: z.string().optional(),
  selectedBankAccountId: z.number().optional(),
  password: passwordSchema.optional(),
  profilePictureUrl: z.string(),
  currency: z.string().min(1, 'validation.user.currency'),
  language: z.string().min(1, 'validation.user.language'),
  stripeCustomerId: z.string(),
  stripeSubscriptionId: z.string()
});

export type UserType = z.infer<typeof userSchema>;
