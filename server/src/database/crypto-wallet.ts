import type { CryptoWalletBody } from '@invoicetrackr/types';
import { and, eq } from 'drizzle-orm';

import { db } from './db';
import { cryptoWalletsTable } from './schema';

const walletSelection = {
  id: cryptoWalletsTable.id,
  label: cryptoWalletsTable.label,
  asset: cryptoWalletsTable.asset,
  network: cryptoWalletsTable.network,
  address: cryptoWalletsTable.address,
  memo: cryptoWalletsTable.memo,
  isDefault: cryptoWalletsTable.isDefault
};

export const getCryptoWalletsFromDb = (userId: number) =>
  db
    .select(walletSelection)
    .from(cryptoWalletsTable)
    .where(eq(cryptoWalletsTable.userId, userId));

export const getCryptoWalletFromDb = async (userId: number, id: number) =>
  (
    await db
      .select(walletSelection)
      .from(cryptoWalletsTable)
      .where(
        and(
          eq(cryptoWalletsTable.userId, userId),
          eq(cryptoWalletsTable.id, id)
        )
      )
  ).at(0);

export const findCryptoWalletFromDb = async (
  userId: number,
  network: string,
  address: string
) =>
  (
    await db
      .select({ id: cryptoWalletsTable.id })
      .from(cryptoWalletsTable)
      .where(
        and(
          eq(cryptoWalletsTable.userId, userId),
          eq(cryptoWalletsTable.network, network),
          eq(cryptoWalletsTable.address, address)
        )
      )
  ).at(0);

export const insertCryptoWalletInDb = (
  userId: number,
  wallet: Omit<CryptoWalletBody, 'id'>
) =>
  db.transaction(async (tx) => {
    if (wallet.isDefault) {
      await tx
        .update(cryptoWalletsTable)
        .set({ isDefault: false })
        .where(eq(cryptoWalletsTable.userId, userId));
    }
    return (
      await tx
        .insert(cryptoWalletsTable)
        .values({ ...wallet, memo: wallet.memo || null, userId })
        .returning(walletSelection)
    ).at(0);
  });

export const updateCryptoWalletInDb = (
  userId: number,
  id: number,
  wallet: Omit<CryptoWalletBody, 'id'>
) =>
  db.transaction(async (tx) => {
    if (wallet.isDefault) {
      await tx
        .update(cryptoWalletsTable)
        .set({ isDefault: false })
        .where(eq(cryptoWalletsTable.userId, userId));
    }
    return (
      await tx
        .update(cryptoWalletsTable)
        .set({
          ...wallet,
          memo: wallet.memo || null,
          updatedAt: new Date().toISOString()
        })
        .where(
          and(
            eq(cryptoWalletsTable.userId, userId),
            eq(cryptoWalletsTable.id, id)
          )
        )
        .returning(walletSelection)
    ).at(0);
  });

export const deleteCryptoWalletFromDb = async (userId: number, id: number) =>
  (
    await db
      .delete(cryptoWalletsTable)
      .where(
        and(
          eq(cryptoWalletsTable.userId, userId),
          eq(cryptoWalletsTable.id, id)
        )
      )
      .returning({ id: cryptoWalletsTable.id })
  ).at(0);
