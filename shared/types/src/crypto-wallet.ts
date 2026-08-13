import z from 'zod/v4';

const normalizeAsset = (value: string) => value.trim().toUpperCase();

export const cryptoWalletBodySchema = z.object({
  id: z.coerce.number().optional(),
  label: z.string().trim().min(1, 'validation.cryptoWallet.label').max(100),
  asset: z
    .string()
    .trim()
    .min(1, 'validation.cryptoWallet.asset')
    .max(20)
    .transform(normalizeAsset),
  network: z.string().trim().min(1, 'validation.cryptoWallet.network').max(100),
  address: z.string().trim().min(1, 'validation.cryptoWallet.address').max(255),
  memo: z.string().trim().max(255).nullish(),
  isDefault: z.boolean().optional()
});

export const cryptoWalletInputSchema = cryptoWalletBodySchema.omit({
  id: true
});

export type CryptoWalletBody = z.infer<typeof cryptoWalletBodySchema>;
export type CryptoWalletInput = z.infer<typeof cryptoWalletInputSchema>;
