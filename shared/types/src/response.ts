import z from 'zod/v4';

export const messageResponseSchema = z.object({
  message: z.string()
});

export type MessageResponse = z.infer<typeof messageResponseSchema>;
