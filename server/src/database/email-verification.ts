import { desc, eq } from 'drizzle-orm';

import { db } from './db';
import { emailVerificationTokensTable } from './schema';

export const saveEmailVerificationTokenToDb = async (
  userId: number,
  token: string,
  expiresAt: string
) => {
  const now = new Date().toISOString();

  await db.transaction(async (trx) => {
    await trx
      .delete(emailVerificationTokensTable)
      .where(eq(emailVerificationTokensTable.userId, userId));

    await trx.insert(emailVerificationTokensTable).values({
      userId,
      token,
      expiresAt,
      lastSentAt: now
    });
  });
};

export const getEmailVerificationTokenFromDb = async (token: string) => {
  const [selectedToken] = await db
    .select()
    .from(emailVerificationTokensTable)
    .where(eq(emailVerificationTokensTable.token, token));

  return selectedToken;
};

export const getLatestEmailVerificationTokenForUserFromDb = async (
  userId: number
) => {
  const [selectedToken] = await db
    .select()
    .from(emailVerificationTokensTable)
    .where(eq(emailVerificationTokensTable.userId, userId))
    .orderBy(desc(emailVerificationTokensTable.createdAt))
    .limit(1);

  return selectedToken;
};

export const markEmailVerificationTokenUsedInDb = async (token: string) => {
  const [updatedToken] = await db
    .update(emailVerificationTokensTable)
    .set({ usedAt: new Date().toISOString() })
    .where(eq(emailVerificationTokensTable.token, token))
    .returning({ id: emailVerificationTokensTable.id });

  return updatedToken?.id;
};
