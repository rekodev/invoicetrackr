import { z } from 'zod';

export const bankingInformationSchema = z.object({
  id: z.number(),
  bankName: z.string(),
  bankCode: z.string(),
  bankAccountNumber: z.string(),
});

export const userSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  type: z.literal('sender'),
  businessType: z.union([z.literal('individual'), z.literal('business')]),
  businessNumber: z.string(),
  address: z.string(),
  email: z.string(),
  bankingInformation: z.array(bankingInformationSchema),
  selectedBankId: z.number().nullable(),
});

export type UserModel = z.infer<typeof userSchema>;
export type BankingInformation = z.infer<typeof bankingInformationSchema>;
