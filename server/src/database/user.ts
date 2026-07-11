import {
  AnalyticsConsentStatus,
  DEFAULT_CURRENCY,
  UserBody,
  UserProfileUpdateBody
} from '@invoicetrackr/types';
import { and, eq, sql } from 'drizzle-orm';

import { db } from './db';
import {
  businessProfilesTable,
  InsertUser,
  passwordResetTokensTable,
  usersTable
} from './schema';

const userSelection = {
  id: usersTable.id,
  name: businessProfilesTable.legalName,
  type: sql<'sender'>`'sender'`,
  businessType: sql<'individual'>`'individual'`,
  businessNumber: businessProfilesTable.activityCertificateNumber,
  vatNumber: businessProfilesTable.vatNumber,
  selectedBankAccountId: businessProfilesTable.selectedBankAccountId,
  address: businessProfilesTable.address,
  email: usersTable.email,
  invoiceEmail: businessProfilesTable.invoiceEmail,
  phone: businessProfilesTable.phone,
  emailVerifiedAt: usersTable.emailVerifiedAt,
  createdAt: usersTable.createdAt,
  updatedAt: businessProfilesTable.updatedAt,
  signature: businessProfilesTable.signatureUrl,
  profilePictureUrl: businessProfilesTable.logoUrl,
  currency: businessProfilesTable.currency,
  language: usersTable.language,
  preferredInvoiceLanguage: businessProfilesTable.preferredInvoiceLanguage,
  isVatPayer: businessProfilesTable.isVatPayer,
  defaultInvoiceVatMode: businessProfilesTable.defaultInvoiceVatMode,
  defaultInvoiceSeries: businessProfilesTable.defaultInvoiceSeries,
  defaultPaymentTermsDays: businessProfilesTable.defaultPaymentTermsDays,
  onboardingCompletedAt: businessProfilesTable.onboardingCompletedAt,
  analyticsConsentStatus: usersTable.analyticsConsentStatus,
  analyticsConsentUpdatedAt: usersTable.analyticsConsentUpdatedAt
};

export const getUserFromDb = async (id: number) => {
  const users = await db
    .select(userSelection)
    .from(usersTable)
    .innerJoin(businessProfilesTable, eq(businessProfilesTable.userId, usersTable.id))
    .where(eq(usersTable.id, id));

  return users.at(0);
};

export const getUserByEmailFromDb = async (email: string) => {
  const users = await db
    .select({ ...userSelection, password: usersTable.password })
    .from(usersTable)
    .innerJoin(businessProfilesTable, eq(businessProfilesTable.userId, usersTable.id))
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
}: Pick<InsertUser, 'email' | 'password' | 'language'> & {
  name?: string;
  profilePictureUrl?: string;
  emailVerifiedAt?: string | null;
  analyticsConsentStatus?: InsertUser['analyticsConsentStatus'];
}): Promise<{ id: number; email: string } | undefined> => {
  return db.transaction(async (tx) => {
    const [user] = await tx
      .insert(usersTable)
      .values({
        email,
        password,
        emailVerifiedAt,
        language,
        analyticsConsentStatus,
        analyticsConsentUpdatedAt: analyticsConsentStatus ? new Date().toISOString() : null
      })
      .returning({ id: usersTable.id, email: usersTable.email });

    if (!user) return undefined;

    await tx.insert(businessProfilesTable).values({
      userId: user.id,
      legalName: name,
      invoiceEmail: email,
      logoUrl: profilePictureUrl,
      currency: DEFAULT_CURRENCY
    });

    return user;
  });
};

export type UserUpdateResult = NonNullable<Awaited<ReturnType<typeof getUserFromDb>>>;

export const updateUserInDb = async (
  user: UserProfileUpdateBody & { id: number },
  signature: string
): Promise<{ id: number } | undefined> => {
  const {
    name,
    address,
    businessNumber,
    phone,
    invoiceEmail,
    vatNumber,
    isVatPayer
  } = user;
  const normalizedIsVatPayer = Boolean(isVatPayer);
  const normalizedVatNumber = normalizedIsVatPayer
    ? vatNumber?.trim() || null
    : null;

  const profiles = await db
    .update(businessProfilesTable)
    .set({
      legalName: name,
      activityCertificateNumber: businessNumber,
      vatNumber: normalizedVatNumber,
      isVatPayer: normalizedIsVatPayer,
      ...(normalizedIsVatPayer ? {} : { defaultInvoiceVatMode: 'no_vat' }),
      address,
      invoiceEmail: invoiceEmail || user.email,
      phone,
      signatureUrl: signature,
      onboardingCompletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    .where(eq(businessProfilesTable.userId, Number(user.id)))
    .returning({ id: businessProfilesTable.userId });

  return profiles.at(0);
};

export const updateUserSelectedBankAccountInDb = async (
  userId: number,
  selectedBankAccountId: number
): Promise<{ id: number } | undefined> => {
  const users = await db
    .update(businessProfilesTable)
    .set({ selectedBankAccountId, updatedAt: new Date().toISOString() })
    .where(eq(businessProfilesTable.userId, userId))
    .returning({ id: businessProfilesTable.userId });

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
  await db.update(businessProfilesTable).set({ logoUrl: url, updatedAt: new Date().toISOString() }).where(eq(businessProfilesTable.userId, userId));
  return getUserFromDb(userId);
};

export const updateUserAccountSettingsInDb = async (
  userId: number,
  language: string,
  _currency: string,
  preferredInvoiceLanguage?: string,
  isVatPayer = false,
  defaultInvoiceVatMode: UserBody['defaultInvoiceVatMode'] = 'no_vat',
  defaultInvoiceSeries = 'SF',
  defaultPaymentTermsDays: UserBody['defaultPaymentTermsDays'] = 30
): Promise<UserUpdateResult | undefined> => {
  const updateData: Partial<typeof businessProfilesTable.$inferInsert> = {
    currency: DEFAULT_CURRENCY,
    isVatPayer,
    defaultInvoiceVatMode: isVatPayer ? defaultInvoiceVatMode : 'no_vat',
    defaultInvoiceSeries,
    defaultPaymentTermsDays,
    updatedAt: new Date().toISOString()
  };

  if (preferredInvoiceLanguage) {
    updateData.preferredInvoiceLanguage = preferredInvoiceLanguage;
  }

  await db.transaction(async (tx) => {
    await tx.update(usersTable).set({ language }).where(eq(usersTable.id, userId));
    await tx
      .update(businessProfilesTable)
      .set(updateData)
      .where(eq(businessProfilesTable.userId, userId));
  });

  return getUserFromDb(userId);
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
