import { z } from 'zod';

export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.literal('sender'),
  businessType: z.union([z.literal('individual'), z.literal('business')]),
  businessNumber: z.string(),
  address: z.string(),
  email: z.string(),
});

export type UserModel = z.infer<typeof userSchema>;
