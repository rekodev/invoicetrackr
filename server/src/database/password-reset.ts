import { eq } from 'drizzle-orm';
import { db } from './db';
import { passwordResetTokensTable } from './schema';

export const saveResetTokenToDb = async (
  userId: number,
  token: string,
  expiresAt: string
) => {
  await db.transaction(async (trx) => {
    await trx
      .delete(passwordResetTokensTable)
      .where(eq(passwordResetTokensTable.userId, userId));

    await trx
      .insert(passwordResetTokensTable)
      .values({ userId, token, expiresAt });
  });
};
