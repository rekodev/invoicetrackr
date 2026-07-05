import { AnalyticsConsentStatus, UserBody } from '@invoicetrackr/types';
import { and, eq } from 'drizzle-orm';

import {
  InsertUser,
  SelectUser,
  passwordResetTokensTable,
  stripeAccountsTable,
  usersTable
} from './schema';
import { db } from './db';

export const getUserFromDb = async (
  id: number
): Promise<
  | (Omit<SelectUser, 'password'> & {
      stripeCustomerId: string | null;
      stripeSubscriptionId: string | null;
    })
  | undefined
> => {
  const users = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      type: usersTable.type,
      businessType: usersTable.businessType,
      businessNumber: usersTable.businessNumber,
      vatNumber: usersTable.vatNumber,
      selectedBankAccountId: usersTable.selectedBankAccountId,
      address: usersTable.address,
      email: usersTable.email,
      emailVerifiedAt: usersTable.emailVerifiedAt,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
      signature: usersTable.signature,
      profilePictureUrl: usersTable.profilePictureUrl,
      currency: usersTable.currency,
      language: usersTable.language,
      preferredInvoiceLanguage: usersTable.preferredInvoiceLanguage,
      isVatPayer: usersTable.isVatPayer,
      defaultInvoiceVatMode: usersTable.defaultInvoiceVatMode,
      defaultInvoiceSeries: usersTable.defaultInvoiceSeries,
      defaultPaymentTermsDays: usersTable.defaultPaymentTermsDays,
      stripeCustomerId: stripeAccountsTable.stripeCustomerId,
      stripeSubscriptionId: stripeAccountsTable.stripeSubscriptionId,
      subscriptionStatus: usersTable.subscriptionStatus,
      onboardingCompletedAt: usersTable.onboardingCompletedAt,
      trialStartedAt: usersTable.trialStartedAt,
      trialEndsAt: usersTable.trialEndsAt,
      subscriptionGraceEndsAt: usersTable.subscriptionGraceEndsAt,
      subscriptionCurrentPeriodEndsAt:
        usersTable.subscriptionCurrentPeriodEndsAt,
      subscriptionCancelAt: usersTable.subscriptionCancelAt,
      paymentSuccessPending: usersTable.paymentSuccessPending,
      analyticsConsentStatus: usersTable.analyticsConsentStatus,
      analyticsConsentUpdatedAt: usersTable.analyticsConsentUpdatedAt
    })
    .from(usersTable)
    .leftJoin(
      stripeAccountsTable,
      eq(stripeAccountsTable.userId, usersTable.id)
    )
    .where(eq(usersTable.id, id));

  return users.at(0);
};

export const getUserByEmailFromDb = async (
  email: string
): Promise<
  | (SelectUser & {
      stripeCustomerId: string | null;
      stripeSubscriptionId: string | null;
    })
  | undefined
> => {
  const users = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      type: usersTable.type,
      businessType: usersTable.businessType,
      businessNumber: usersTable.businessNumber,
      vatNumber: usersTable.vatNumber,
      selectedBankAccountId: usersTable.selectedBankAccountId,
      address: usersTable.address,
      email: usersTable.email,
      emailVerifiedAt: usersTable.emailVerifiedAt,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
      signature: usersTable.signature,
      profilePictureUrl: usersTable.profilePictureUrl,
      currency: usersTable.currency,
      language: usersTable.language,
      preferredInvoiceLanguage: usersTable.preferredInvoiceLanguage,
      isVatPayer: usersTable.isVatPayer,
      defaultInvoiceVatMode: usersTable.defaultInvoiceVatMode,
      defaultInvoiceSeries: usersTable.defaultInvoiceSeries,
      defaultPaymentTermsDays: usersTable.defaultPaymentTermsDays,
      password: usersTable.password,
      stripeCustomerId: stripeAccountsTable.stripeCustomerId,
      stripeSubscriptionId: stripeAccountsTable.stripeSubscriptionId,
      subscriptionStatus: usersTable.subscriptionStatus,
      onboardingCompletedAt: usersTable.onboardingCompletedAt,
      trialStartedAt: usersTable.trialStartedAt,
      trialEndsAt: usersTable.trialEndsAt,
      subscriptionGraceEndsAt: usersTable.subscriptionGraceEndsAt,
      subscriptionCurrentPeriodEndsAt:
        usersTable.subscriptionCurrentPeriodEndsAt,
      subscriptionCancelAt: usersTable.subscriptionCancelAt,
      paymentSuccessPending: usersTable.paymentSuccessPending,
      analyticsConsentStatus: usersTable.analyticsConsentStatus,
      analyticsConsentUpdatedAt: usersTable.analyticsConsentUpdatedAt
    })
    .from(usersTable)
    .leftJoin(
      stripeAccountsTable,
      eq(stripeAccountsTable.userId, usersTable.id)
    )
    .where(eq(usersTable.email, email));

  return users.at(0);
};

export const registerUser = async ({
  email,
  password,
  language,
  name = '',
  profilePictureUrl = '',
  emailVerifiedAt = null,
  analyticsConsentStatus = null
}: Pick<InsertUser, 'email' | 'password' | 'language'> &
  Partial<
    Pick<
      InsertUser,
      | 'name'
      | 'profilePictureUrl'
      | 'emailVerifiedAt'
      | 'analyticsConsentStatus'
    >
  >): Promise<{ id: number; email: string } | undefined> => {
  const users = await db
    .insert(usersTable)
    .values({
      email,
      password,
      emailVerifiedAt,
      currency: 'eur',
      language,
      type: 'sender',
      businessType: 'individual',
      businessNumber: '',
      vatNumber: null,
      name,
      address: '',
      signature: '',
      profilePictureUrl,
      analyticsConsentStatus,
      analyticsConsentUpdatedAt: analyticsConsentStatus
        ? new Date().toISOString()
        : null
    })
    .returning({ id: usersTable.id, email: usersTable.email });

  return users.at(0);
};

export type UserUpdateResult = Omit<
  SelectUser,
  | 'createdAt'
  | 'updatedAt'
  | 'stripeCustomerId'
  | 'stripeSubscriptionId'
  | 'selectedBankAccountId'
  | 'password'
  | 'onboardingCompletedAt'
  | 'trialStartedAt'
  | 'trialEndsAt'
  | 'subscriptionGraceEndsAt'
  | 'subscriptionCurrentPeriodEndsAt'
  | 'subscriptionCancelAt'
>;

export const updateUserInDb = async (
  user: Pick<
    UserBody,
    | 'id'
    | 'email'
    | 'name'
    | 'businessType'
    | 'businessNumber'
    | 'vatNumber'
    | 'address'
  >,
  signature: string,
  shouldResetEmailVerification = false
): Promise<{ id: number } | undefined> => {
  const { name, address, businessNumber, businessType, email, vatNumber } =
    user;

  const users = await db
    .update(usersTable)
    .set({
      name,
      businessType,
      businessNumber,
      vatNumber,
      address,
      email,
      ...(shouldResetEmailVerification ? { emailVerifiedAt: null } : {}),
      signature,
      onboardingCompletedAt: new Date().toISOString()
    })
    .where(eq(usersTable.id, Number(user.id)))
    .returning({ id: usersTable.id });

  return users.at(0);
};

export const updateUserSelectedBankAccountInDb = async (
  userId: number,
  selectedBankAccountId: number
): Promise<{ id: number } | undefined> => {
  const users = await db
    .update(usersTable)
    .set({ selectedBankAccountId })
    .where(eq(usersTable.id, userId))
    .returning({ id: usersTable.id });

  return users.at(0);
};

export const updateUserAnalyticsConsentInDb = async (
  userId: number,
  analyticsConsentStatus: AnalyticsConsentStatus
): Promise<
  | {
      id: number;
      analyticsConsentStatus: AnalyticsConsentStatus | null;
      analyticsConsentUpdatedAt: string | null;
    }
  | undefined
> => {
  const users = await db
    .update(usersTable)
    .set({
      analyticsConsentStatus,
      analyticsConsentUpdatedAt: new Date().toISOString()
    })
    .where(eq(usersTable.id, userId))
    .returning({
      id: usersTable.id,
      analyticsConsentStatus: usersTable.analyticsConsentStatus,
      analyticsConsentUpdatedAt: usersTable.analyticsConsentUpdatedAt
    });

  return users.at(0) as
    | {
        id: number;
        analyticsConsentStatus: AnalyticsConsentStatus | null;
        analyticsConsentUpdatedAt: string | null;
      }
    | undefined;
};

export const updateUserProfilePictureInDb = async (
  userId: number,
  url: string
): Promise<UserUpdateResult | undefined> => {
  const users = await db
    .update(usersTable)
    .set({ profilePictureUrl: url })
    .where(eq(usersTable.id, userId))
    .returning({
      id: usersTable.id,
      name: usersTable.name,
      type: usersTable.type,
      businessType: usersTable.businessType,
      businessNumber: usersTable.businessNumber,
      vatNumber: usersTable.vatNumber,
      address: usersTable.address,
      email: usersTable.email,
      emailVerifiedAt: usersTable.emailVerifiedAt,
      signature: usersTable.signature,
      profilePictureUrl: usersTable.profilePictureUrl,
      language: usersTable.language,
      preferredInvoiceLanguage: usersTable.preferredInvoiceLanguage,
      isVatPayer: usersTable.isVatPayer,
      defaultInvoiceVatMode: usersTable.defaultInvoiceVatMode,
      defaultInvoiceSeries: usersTable.defaultInvoiceSeries,
      defaultPaymentTermsDays: usersTable.defaultPaymentTermsDays,
      currency: usersTable.currency,
      subscriptionStatus: usersTable.subscriptionStatus,
      analyticsConsentStatus: usersTable.analyticsConsentStatus,
      analyticsConsentUpdatedAt: usersTable.analyticsConsentUpdatedAt
    });

  return users.at(0);
};

export const updateUserAccountSettingsInDb = async (
  userId: number,
  language: string,
  currency: string,
  preferredInvoiceLanguage?: string,
  isVatPayer = false,
  defaultInvoiceVatMode: UserBody['defaultInvoiceVatMode'] = 'no_vat',
  defaultInvoiceSeries = 'SF',
  defaultPaymentTermsDays: UserBody['defaultPaymentTermsDays'] = 30
): Promise<UserUpdateResult | undefined> => {
  const updateData: Partial<typeof usersTable.$inferInsert> = {
    language,
    currency,
    isVatPayer,
    defaultInvoiceVatMode: isVatPayer ? defaultInvoiceVatMode : 'no_vat',
    defaultInvoiceSeries,
    defaultPaymentTermsDays
  };

  if (preferredInvoiceLanguage) {
    updateData.preferredInvoiceLanguage = preferredInvoiceLanguage;
  }

  const users = await db
    .update(usersTable)
    .set(updateData)
    .where(eq(usersTable.id, userId))
    .returning({
      id: usersTable.id,
      name: usersTable.name,
      type: usersTable.type,
      businessType: usersTable.businessType,
      businessNumber: usersTable.businessNumber,
      vatNumber: usersTable.vatNumber,
      address: usersTable.address,
      email: usersTable.email,
      emailVerifiedAt: usersTable.emailVerifiedAt,
      signature: usersTable.signature,
      profilePictureUrl: usersTable.profilePictureUrl,
      language: usersTable.language,
      preferredInvoiceLanguage: usersTable.preferredInvoiceLanguage,
      isVatPayer: usersTable.isVatPayer,
      defaultInvoiceVatMode: usersTable.defaultInvoiceVatMode,
      defaultInvoiceSeries: usersTable.defaultInvoiceSeries,
      defaultPaymentTermsDays: usersTable.defaultPaymentTermsDays,
      currency: usersTable.currency,
      subscriptionStatus: usersTable.subscriptionStatus,
      analyticsConsentStatus: usersTable.analyticsConsentStatus,
      analyticsConsentUpdatedAt: usersTable.analyticsConsentUpdatedAt
    });

  return users.at(0);
};

export const deleteUserFromDb = async (
  id: number
): Promise<{ id: number } | undefined> => {
  const users = await db
    .delete(usersTable)
    .where(eq(usersTable.id, id))
    .returning({ id: usersTable.id });

  return users.at(0);
};

export const getUserPasswordHashFromDb = async (id: number) => {
  const users = await db
    .select({ password: usersTable.password })
    .from(usersTable)
    .where(eq(usersTable.id, id));

  return users.at(0)?.password;
};

export const changeUserPasswordInDb = async (
  id: number,
  password: string
): Promise<{ id: number } | undefined> => {
  const users = await db
    .update(usersTable)
    .set({ password })
    .where(eq(usersTable.id, id))
    .returning({ id: usersTable.id });

  return users.at(0);
};

export const getUserResetPasswordTokenFromDb = async (token: string) => {
  const [selectedToken] = await db
    .select()
    .from(passwordResetTokensTable)
    .where(eq(passwordResetTokensTable.token, token));

  return selectedToken;
};

export const invalidateTokenInDb = async (userId: number, token: string) => {
  const [updatedToken] = await db
    .update(passwordResetTokensTable)
    .set({ expiresAt: new Date().toISOString() })
    .where(
      and(
        eq(passwordResetTokensTable.token, token),
        eq(passwordResetTokensTable.userId, userId)
      )
    )
    .returning({ id: passwordResetTokensTable.id });

  return updatedToken?.id;
};

export const getUserCurrencyFromDb = async (userId: number) => {
  const [user] = await db
    .select({ currency: usersTable.currency })
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  return user?.currency as 'eur' | 'usd';
};

export const verifyUserEmailInDb = async (
  userId: number
): Promise<{ id: number; emailVerifiedAt: string | null } | undefined> => {
  const [user] = await db
    .update(usersTable)
    .set({ emailVerifiedAt: new Date().toISOString() })
    .where(eq(usersTable.id, userId))
    .returning({
      id: usersTable.id,
      emailVerifiedAt: usersTable.emailVerifiedAt
    });

  return user;
};

export const getUserEmailVerificationStatusFromDb = async (userId: number) => {
  const [user] = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      emailVerifiedAt: usersTable.emailVerifiedAt,
      language: usersTable.language
    })
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  return user;
};
