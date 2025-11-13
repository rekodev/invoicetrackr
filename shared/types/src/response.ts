import z from 'zod/v4';
import { userBodySchema, resetPasswordTokenGetSchema } from './user';
import { bankAccountBodySchema } from './bank-account';
import { clientBodySchema } from './client';
import { invoiceBodySchema } from './invoice';

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
  user: userBodySchema,
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

export const postInvoiceResponseSchema = z.object({
  invoice: invoiceBodySchema,
  message: z.string()
});

export const updateInvoiceResponseSchema = z.object({
  invoice: invoiceBodySchema,
  message: z.string()
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
      name: z.string(),
      email: z.string()
    })
  )
});

// Contact response schema
export const postContactResponseSchema = messageResponseSchema;

// Payment response schemas
export const createCustomerResponseSchema = z.object({
  customerId: z.string(),
  message: z.string()
});

export const createSubscriptionResponseSchema = z.object({
  type: z.string(),
  clientSecret: z.string(),
  message: z.string()
});

export const getStripeCustomerIdResponseSchema = z.object({
  customerId: z.string()
});

export const cancelStripeSubscriptionResponseSchema = messageResponseSchema;

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
export type PostInvoiceResponse = z.infer<typeof postInvoiceResponseSchema>;
export type UpdateInvoiceResponse = z.infer<typeof updateInvoiceResponseSchema>;
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

export type CreateCustomerResponse = z.infer<
  typeof createCustomerResponseSchema
>;
export type CreateSubscriptionResponse = z.infer<
  typeof createSubscriptionResponseSchema
>;
export type GetStripeCustomerIdResponse = z.infer<
  typeof getStripeCustomerIdResponseSchema
>;
export type CancelStripeSubscriptionResponse = z.infer<
  typeof cancelStripeSubscriptionResponseSchema
>;
