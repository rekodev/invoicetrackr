import { BillingStatus, StripeSubscriptionStatus } from '@invoicetrackr/types';
import { eq } from 'drizzle-orm';

import {
  stripeAccountsTable,
  stripeMerchantAccountsTable,
  stripeWebhookEventsTable,
  usersTable
} from './schema';
import { db } from './db';

type BillingUpdate = {
  subscriptionStatus?: StripeSubscriptionStatus | null;
  onboardingCompletedAt?: string | null;
  trialStartedAt?: string | null;
  trialEndsAt?: string | null;
  subscriptionGraceEndsAt?: string | null;
  subscriptionCurrentPeriodEndsAt?: string | null;
  subscriptionCancelAt?: string | null;
  paymentSuccessPending?: boolean;
};

export const hasPaidAccess = ({
  subscriptionStatus,
  subscriptionGraceEndsAt
}: Pick<BillingStatus, 'subscriptionStatus' | 'subscriptionGraceEndsAt'>) =>
  subscriptionStatus === 'active' ||
  subscriptionStatus === 'trialing' ||
  (subscriptionStatus === 'past_due' &&
    !!subscriptionGraceEndsAt &&
    new Date(subscriptionGraceEndsAt) > new Date());

export const getBillingStatusFromDb = async (
  userId: number
): Promise<BillingStatus | undefined> => {
  const [billing] = await db
    .select({
      subscriptionStatus: usersTable.subscriptionStatus,
      onboardingCompletedAt: usersTable.onboardingCompletedAt,
      trialStartedAt: usersTable.trialStartedAt,
      trialEndsAt: usersTable.trialEndsAt,
      subscriptionGraceEndsAt: usersTable.subscriptionGraceEndsAt,
      subscriptionCurrentPeriodEndsAt:
        usersTable.subscriptionCurrentPeriodEndsAt,
      subscriptionCancelAt: usersTable.subscriptionCancelAt,
      paymentSuccessPending: usersTable.paymentSuccessPending
    })
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (!billing) return undefined;

  const typedBilling = billing as Omit<
    BillingStatus,
    'hasPaidAccess' | 'hasPaymentMethod'
  >;

  return {
    ...typedBilling,
    hasPaidAccess: hasPaidAccess(typedBilling)
  };
};

export const updateBillingStatusInDb = async (
  userId: number,
  update: BillingUpdate
) => {
  const [updatedUser] = await db
    .update(usersTable)
    .set(update)
    .where(eq(usersTable.id, userId))
    .returning({ id: usersTable.id });

  return updatedUser?.id;
};

export const consumePaymentSuccessPendingInDb = async (userId: number) => {
  const [billing] = await db
    .update(usersTable)
    .set({ paymentSuccessPending: false })
    .where(eq(usersTable.id, userId))
    .returning({
      subscriptionStatus: usersTable.subscriptionStatus,
      onboardingCompletedAt: usersTable.onboardingCompletedAt,
      trialStartedAt: usersTable.trialStartedAt,
      trialEndsAt: usersTable.trialEndsAt,
      subscriptionGraceEndsAt: usersTable.subscriptionGraceEndsAt,
      subscriptionCurrentPeriodEndsAt:
        usersTable.subscriptionCurrentPeriodEndsAt,
      subscriptionCancelAt: usersTable.subscriptionCancelAt,
      paymentSuccessPending: usersTable.paymentSuccessPending
    });

  if (!billing) return undefined;

  const typedBilling = billing as Omit<
    BillingStatus,
    'hasPaidAccess' | 'hasPaymentMethod'
  >;

  return {
    ...typedBilling,
    hasPaidAccess: hasPaidAccess(typedBilling)
  };
};

export const upsertStripeAccountInDb = async (
  userId: number,
  stripeCustomerId: string,
  stripeSubscriptionId?: string | null
) => {
  const [account] = await db
    .insert(stripeAccountsTable)
    .values({ userId, stripeCustomerId, stripeSubscriptionId })
    .onConflictDoUpdate({
      target: stripeAccountsTable.userId,
      set: { stripeCustomerId, stripeSubscriptionId }
    })
    .returning({ id: stripeAccountsTable.id });

  return account?.id;
};

export const updateStripeSubscriptionForUserInDb = async (
  userId: number,
  stripeSubscriptionId: string | null
) => {
  const [account] = await db
    .update(stripeAccountsTable)
    .set({ stripeSubscriptionId })
    .where(eq(stripeAccountsTable.userId, userId))
    .returning({ id: stripeAccountsTable.id });

  return account?.id;
};

export const getStripeAccountFromDb = async (userId: number) => {
  const [account] = await db
    .select()
    .from(stripeAccountsTable)
    .where(eq(stripeAccountsTable.userId, userId));

  return account;
};

export const getStripeCustomerIdFromDb = async (userId: number) =>
  (await getStripeAccountFromDb(userId))?.stripeCustomerId;

export const getStripeCustomerSubscriptionIdFromDb = async (userId: number) =>
  (await getStripeAccountFromDb(userId))?.stripeSubscriptionId;

export const getUserByStripeCustomerIdFromDb = async (
  stripeCustomerId: string
) => {
  const [user] = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      name: usersTable.name,
      language: usersTable.language
    })
    .from(stripeAccountsTable)
    .innerJoin(usersTable, eq(usersTable.id, stripeAccountsTable.userId))
    .where(eq(stripeAccountsTable.stripeCustomerId, stripeCustomerId));

  return user;
};

type MerchantAccountUpdate = {
  stripeConnectedAccountId: string;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  detailsSubmitted?: boolean;
  onboardingCompletedAt?: string | null;
};

export const upsertStripeMerchantAccountInDb = async (
  userId: number,
  update: MerchantAccountUpdate
) => {
  const [account] = await db
    .insert(stripeMerchantAccountsTable)
    .values({
      userId,
      stripeConnectedAccountId: update.stripeConnectedAccountId,
      chargesEnabled: !!update.chargesEnabled,
      payoutsEnabled: !!update.payoutsEnabled,
      detailsSubmitted: !!update.detailsSubmitted,
      onboardingCompletedAt: update.onboardingCompletedAt,
      updatedAt: new Date().toISOString()
    })
    .onConflictDoUpdate({
      target: stripeMerchantAccountsTable.userId,
      set: {
        stripeConnectedAccountId: update.stripeConnectedAccountId,
        chargesEnabled: !!update.chargesEnabled,
        payoutsEnabled: !!update.payoutsEnabled,
        detailsSubmitted: !!update.detailsSubmitted,
        onboardingCompletedAt: update.onboardingCompletedAt,
        updatedAt: new Date().toISOString()
      }
    })
    .returning({ id: stripeMerchantAccountsTable.id });

  return account?.id;
};

export const getStripeMerchantAccountFromDb = async (
  userId: number
): Promise<ReturnType<typeof getStripeMerchantAccountFromDb> | undefined> => {
  const [account] = await db
    .select()
    .from(stripeMerchantAccountsTable)
    .where(eq(stripeMerchantAccountsTable.userId, userId));

  return account;
};

export const toMerchantPaymentStatus = (
  account: Awaited<ReturnType<typeof getStripeMerchantAccountFromDb>>
) => {
  const ready = !!account?.chargesEnabled && !!account.detailsSubmitted;

  return {
    provider: 'stripe_connect' as const,
    connectedAccountId: account?.stripeConnectedAccountId || null,
    chargesEnabled: !!account?.chargesEnabled,
    payoutsEnabled: !!account?.payoutsEnabled,
    detailsSubmitted: !!account?.detailsSubmitted,
    onboardingCompletedAt: account?.onboardingCompletedAt || null,
    ready
  };
};

export const getUserByStripeConnectedAccountIdFromDb = async (
  stripeConnectedAccountId: string
) => {
  const [user] = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      name: usersTable.name,
      language: usersTable.language
    })
    .from(stripeMerchantAccountsTable)
    .innerJoin(
      usersTable,
      eq(usersTable.id, stripeMerchantAccountsTable.userId)
    )
    .where(
      eq(
        stripeMerchantAccountsTable.stripeConnectedAccountId,
        stripeConnectedAccountId
      )
    );

  return user;
};

export const hasProcessedStripeWebhookEvent = async (stripeEventId: string) => {
  const [event] = await db
    .select({ id: stripeWebhookEventsTable.id })
    .from(stripeWebhookEventsTable)
    .where(eq(stripeWebhookEventsTable.stripeEventId, stripeEventId));

  return !!event;
};

export const markStripeWebhookEventProcessed = async (
  stripeEventId: string,
  type: string
) => {
  await db
    .insert(stripeWebhookEventsTable)
    .values({ stripeEventId, type })
    .onConflictDoNothing();
};
