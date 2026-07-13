import z from 'zod/v4';

export const bankAccountBodySchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, 'validation.bankAccount.name').max(255),
  code: z.string().min(1, 'validation.bankAccount.code').max(255),
  accountNumber: z
    .string()
    .min(1, 'validation.bankAccount.accountNumber')
    .max(255)
});

const normalizeBankCode = (value: string) =>
  value.trim().replace(/\s+/g, '').toUpperCase();

const normalizeIban = (value: string) =>
  value.trim().replace(/\s+/g, '').toUpperCase();

const hasValidIbanChecksum = (value: string) => {
  const rearranged = `${value.slice(4)}${value.slice(0, 4)}`;
  let remainder = 0;

  for (const character of rearranged) {
    const numericValue = /[A-Z]/.test(character)
      ? String(character.charCodeAt(0) - 55)
      : character;

    for (const digit of numericValue) {
      remainder = (remainder * 10 + Number(digit)) % 97;
    }
  }

  return remainder === 1;
};

export const bankAccountInputSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().trim().min(1, 'validation.bankAccount.name').max(255),
  code: z
    .string()
    .min(1, 'validation.bankAccount.code')
    .transform(normalizeBankCode)
    .refine(
      (value) =>
        /^\d{5}$/.test(value) ||
        /^[A-Z]{6}[A-Z0-9]{2}(?:[A-Z0-9]{3})?$/.test(value),
      'validation.bankAccount.codeFormat'
    ),
  accountNumber: z
    .string()
    .min(1, 'validation.bankAccount.accountNumber')
    .transform(normalizeIban)
    .refine(
      (value) =>
        /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(value) &&
        hasValidIbanChecksum(value),
      'validation.bankAccount.iban'
    ),
  hasSelectedBankAccount: z.boolean().optional()
});

// Types
export type BankAccountBody = z.infer<typeof bankAccountBodySchema>;
export type BankAccountInput = z.infer<typeof bankAccountInputSchema>;
export type BankAccount = BankAccountBody;
