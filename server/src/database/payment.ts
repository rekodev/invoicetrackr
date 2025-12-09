import { eq } from 'drizzle-orm';

import { stripeAccountsTable, usersTable } from './schema';
import { db } from './db';

export const createStripeCustomerInDb = async (
  userId: number,
  stripeCustomerId: string
) => {
  const [insertedCustomer] = await db
    .insert(stripeAccountsTable)
    .values({
      stripeCustomerId,
      userId,
      stripeSubscriptionId: ''
    })
    .returning({ id: stripeAccountsTable.id });

  return insertedCustomer?.id;
};

export const updateStripeSubscriptionForUserInDb = async (
  userId: number,
  subscriptionId: string
) => {
  const [updatedStripeAccount] = await db
    .update(stripeAccountsTable)
    .set({ stripeSubscriptionId: subscriptionId })
    .where(eq(stripeAccountsTable.userId, userId))
    .returning({ id: stripeAccountsTable.id });

  return updatedStripeAccount?.id;
};

export const getStripeCustomerIdFromDb = async (userId: number) => {
  const [customer] = await db
    .select({ stripeCustomerId: stripeAccountsTable.stripeCustomerId })
    .from(stripeAccountsTable)
    .where(eq(stripeAccountsTable.userId, userId));

  return customer?.stripeCustomerId;
};

export const getStripeCustomerSubscriptionIdFromDb = async (userId: number) => {
  const [customer] = await db
    .select({ stripeSubscriptionId: stripeAccountsTable.stripeSubscriptionId })
    .from(stripeAccountsTable)
    .where(eq(stripeAccountsTable.userId, userId));

  return customer?.stripeSubscriptionId;
};

export const deleteStripeAccountFromDb = async (userId: number) => {
  const stripeAccounts = await db
    .delete(stripeAccountsTable)
    .where(eq(stripeAccountsTable.userId, userId))
    .returning({ id: stripeAccountsTable.id });

  return stripeAccounts.at(0);
};

export const updateUserSubscriptionStatusInDb = async (
  userId: number,
  status: string
) => {
  const [updatedUser] = await db
    .update(usersTable)
    .set({ subscriptionStatus: status })
    .where(eq(usersTable.id, userId))
    .returning({ id: usersTable.id });

  return updatedUser?.id;
};

export const getUserIdByStripeCustomerIdFromDb = async (
  stripeCustomerId: string
) => {
  const [customer] = await db
    .select({ userId: stripeAccountsTable.userId })
    .from(stripeAccountsTable)
    .where(eq(stripeAccountsTable.stripeCustomerId, stripeCustomerId));

  return customer?.userId;
};
