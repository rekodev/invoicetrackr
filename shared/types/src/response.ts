import z from 'zod/v4';
import { userBodySchema, resetPasswordTokenGetSchema } from './user';
import {
  billingIntervalSchema,
  stripeSubscriptionStatusSchema
} from './common';
import { bankAccountBodySchema } from './bank-account';
import { clientBodySchema } from './client';
import { invoiceBodySchema, publicInvoiceSigningSchema } from './invoice';

// Common response schemas
export const messageResponseSchema = z.object({
  message: z.string()
});

// User response schemas
export const loginUserResponseSchema = z.object({
  user: userBodySchema,
  message: z.string()
});

export const getUserResponseSchema = z.object({
  user: userBodySchema
});

export const registerUserResponseSchema = z.object({
  email: z.string(),
  message: z.string()
});

export const updateUserResponseSchema = z.object({
  user: userBodySchema.pick({ id: true }),
  message: z.string()
});

// Bank Account response schemas
export const getBankAccountsResponseSchema = z.object({
  bankAccounts: z.array(bankAccountBodySchema)
});

export const getBankAccountResponseSchema = bankAccountBodySchema;

export const postBankAccountResponseSchema = z.object({
  bankAccount: bankAccountBodySchema,
  message: z.string()
});

export const updateBankAccountResponseSchema = z.object({
  bankAccount: bankAccountBodySchema,
  message: z.string()
});

// Client response schemas
export const getClientsResponseSchema = z.object({
  clients: z.array(clientBodySchema)
});

export const getClientResponseSchema = z.object({
  client: clientBodySchema
});

export const postClientResponseSchema = z.object({
  client: clientBodySchema,
  message: z.string()
});

export const updateClientResponseSchema = z.object({
  client: clientBodySchema,
  message: z.string()
});

// Invoice response schemas
export const getInvoicesResponseSchema = z.object({
  invoices: z.array(invoiceBodySchema)
});

export const getInvoiceResponseSchema = z.object({
  invoice: invoiceBodySchema
});

export const getPublicInvoiceSigningResponseSchema = z.object({
  signing: publicInvoiceSigningSchema
});

export const postInvoiceResponseSchema = z.object({
  invoice: invoiceBodySchema,
  message: z.string()
});

export const updateInvoiceResponseSchema = z.object({
  invoice: invoiceBodySchema,
  message: z.string()
});

export const signInvoiceResponseSchema = z.object({
  invoice: invoiceBodySchema,
  message: z.string()
});

export const getNextInvoiceNumberResponseSchema = z.object({
  invoiceId: z.string(),
  series: z.string(),
  nextNumber: z.number()
});

export const getInvoicesTotalAmountResponseSchema = z.object({
  invoices: z.array(
    z.object({
      totalAmount: z.string(),
      status: z.string()
    })
  ),
  totalClients: z.number()
});

export const getInvoicesRevenueResponseSchema = z.object({
  revenueByMonth: z.record(z.string(), z.number())
});

export const getLatestInvoicesResponseSchema = z.object({
  invoices: z.array(
    z.object({
      id: z.number(),
      invoiceId: z.string(),
      totalAmount: z.string(),
      date: z.string(),
      dueDate: z.string(),
      status: z.string(),
      name: z.string(),
      email: z.string()
    })
  )
});

// Contact response schema
export const postContactResponseSchema = messageResponseSchema;

// Billing response schemas
export const billingStatusSchema = z.object({
  subscriptionStatus: stripeSubscriptionStatusSchema.nullish(),
  onboardingCompletedAt: z.string().nullish(),
  trialStartedAt: z.string().nullish(),
  trialEndsAt: z.string().nullish(),
  subscriptionGraceEndsAt: z.string().nullish(),
  subscriptionCurrentPeriodEndsAt: z.string().nullish(),
  subscriptionCancelAt: z.string().nullish(),
  billingInterval: billingIntervalSchema.nullish().optional(),
  billingRate: z
    .object({
      amount: z.number().nullish(),
      currency: z.string().nullish(),
      interval: z.string().nullish(),
      intervalCount: z.number().nullish()
    })
    .optional(),
  paymentSuccessPending: z.boolean(),
  hasPaymentMethod: z.boolean().optional(),
  billingDetails: z
    .object({
      name: z.string().nullish(),
      email: z.string().nullish(),
      cardBrand: z.string().nullish(),
      cardLast4: z.string().nullish(),
      cardExpMonth: z.number().nullish(),
      cardExpYear: z.number().nullish()
    })
    .optional(),
  hasPaidAccess: z.boolean()
});

export const billingStatusResponseSchema = z.object({
  billing: billingStatusSchema
});

export const consumePaymentSuccessResponseSchema = z.object({
  canShowPaymentSuccess: z.boolean(),
  billing: billingStatusSchema.nullish()
});

export const billingUrlResponseSchema = z.object({
  url: z.string()
});

export const billingIntervalRequestSchema = z.object({
  interval: billingIntervalSchema.optional()
});

// Types
export type MessageResponse = z.infer<typeof messageResponseSchema>;

export type GetUserResponse = z.infer<typeof getUserResponseSchema>;
export type RegisterUserResponse = z.infer<typeof registerUserResponseSchema>;
export type UpdateUserResponse = z.infer<typeof updateUserResponseSchema>;
export type LoginUserResponse = z.infer<typeof loginUserResponseSchema>;
export type UpdateUserAccountSettingsResponse = MessageResponse;
export type DeleteUserAccountResponse = MessageResponse;
export type ResetPasswordResponse = MessageResponse;
export type GetUserResetPasswordTokenResponse = z.infer<
  typeof resetPasswordTokenGetSchema
>;
export type CreateNewPasswordResponse = MessageResponse;

export type GetBankAccountsResponse = z.infer<
  typeof getBankAccountsResponseSchema
>;
export type GetBankAccountResponse = z.infer<
  typeof getBankAccountResponseSchema
>;
export type PostBankAccountResponse = z.infer<
  typeof postBankAccountResponseSchema
>;
export type UpdateBankAccountResponse = z.infer<
  typeof updateBankAccountResponseSchema
>;
export type DeleteBankAccountResponse = MessageResponse;

// Aliases for backwards compatibility
export type GetBankingInformationEntriesResponse = GetBankAccountsResponse;
export type AddBankingInformationResponse = PostBankAccountResponse;
export type UpdateBankingInformationResponse = UpdateBankAccountResponse;
export type DeleteBankingInformationResponse = DeleteBankAccountResponse;

export type GetClientsResponse = z.infer<typeof getClientsResponseSchema>;
export type GetClientResponse = z.infer<typeof getClientResponseSchema>;
export type PostClientResponse = z.infer<typeof postClientResponseSchema>;
export type UpdateClientResponse = z.infer<typeof updateClientResponseSchema>;
export type DeleteClientResponse = MessageResponse;

// Aliases
export type AddClientResponse = PostClientResponse;

export type GetInvoicesResponse = z.infer<typeof getInvoicesResponseSchema>;
export type GetInvoiceResponse = z.infer<typeof getInvoiceResponseSchema>;
export type GetPublicInvoiceSigningResponse = z.infer<
  typeof getPublicInvoiceSigningResponseSchema
>;
export type PostInvoiceResponse = z.infer<typeof postInvoiceResponseSchema>;
export type UpdateInvoiceResponse = z.infer<typeof updateInvoiceResponseSchema>;
export type SignInvoiceResponse = z.infer<typeof signInvoiceResponseSchema>;
export type GetNextInvoiceNumberResponse = z.infer<
  typeof getNextInvoiceNumberResponseSchema
>;
export type GetInvoicesTotalAmountResponse = z.infer<
  typeof getInvoicesTotalAmountResponseSchema
>;
export type GetInvoicesRevenueResponse = z.infer<
  typeof getInvoicesRevenueResponseSchema
>;
export type GetLatestInvoicesResponse = z.infer<
  typeof getLatestInvoicesResponseSchema
>;
export type UpdateInvoiceStatusResponse = MessageResponse;
export type DeleteInvoiceResponse = MessageResponse;
export type SendInvoiceEmailResponse = MessageResponse;

// Aliases
export type AddInvoiceResponse = PostInvoiceResponse;

export type PostContactResponse = z.infer<typeof postContactResponseSchema>;

export type BillingStatus = z.infer<typeof billingStatusSchema>;
export type BillingStatusResponse = z.infer<typeof billingStatusResponseSchema>;
export type ConsumePaymentSuccessResponse = z.infer<
  typeof consumePaymentSuccessResponseSchema
>;
export type BillingUrlResponse = z.infer<typeof billingUrlResponseSchema>;
export type BillingIntervalRequest = z.infer<
  typeof billingIntervalRequestSchema
>;
