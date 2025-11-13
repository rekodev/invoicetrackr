import z from 'zod/v4';

export const bankAccountGetSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  accountNumber: z.string()
});

export const bankAccountBodySchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'validation.bankAccount.name').max(255),
  code: z.string().min(1, 'validation.bankAccount.code').max(255),
  accountNumber: z
    .string()
    .min(1, 'validation.bankAccount.accountNumber')
    .max(255)
});

// Types
export type BankAccountGet = z.infer<typeof bankAccountGetSchema>;
export type BankAccountBody = z.infer<typeof bankAccountBodySchema>;
export type BankAccount = BankAccountGet;
