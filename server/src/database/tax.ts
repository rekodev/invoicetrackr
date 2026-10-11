import type { TaxProfile, TaxProfileBody } from '@invoicetrackr/types';
import { and, eq } from 'drizzle-orm';

import { db } from './db';
import { taxProfilesTable } from './schema';

const ADDITIONAL_PENSION_RATE = '3.00';

type TaxProfileRow = typeof taxProfilesTable.$inferSelect;

const toTaxProfile = (row: TaxProfileRow): TaxProfile => ({
  expenseMethod: row.expenseMethod as TaxProfile['expenseMethod'],
  hasEmploymentPsdCoverage: row.hasEmploymentPsdCoverage,
  hasAdditionalPensionAccumulation: Number(row.additionalPensionRate) > 0,
  activityStartDate: row.activityStartDate,
  activityEndDate: row.activityEndDate,
  otherDeclaredIncome: row.otherDeclaredIncome
});

export const getTaxProfileFromDb = async (userId: number, year: number) => {
  const [row] = await db
    .select()
    .from(taxProfilesTable)
    .where(
      and(eq(taxProfilesTable.userId, userId), eq(taxProfilesTable.taxYear, year))
    )
    .limit(1);

  return row ? toTaxProfile(row) : null;
};

export const upsertTaxProfileInDb = async ({
  userId,
  year,
  profile
}: {
  userId: number;
  year: number;
  profile: TaxProfileBody;
}) => {
  const values = {
    expenseMethod: profile.expenseMethod,
    hasEmploymentPsdCoverage: profile.hasEmploymentPsdCoverage,
    additionalPensionRate: profile.hasAdditionalPensionAccumulation
      ? ADDITIONAL_PENSION_RATE
      : '0',
    activityStartDate: profile.activityStartDate || null,
    activityEndDate: profile.activityEndDate || null,
    otherDeclaredIncome: profile.otherDeclaredIncome
  };

  const [row] = await db
    .insert(taxProfilesTable)
    .values({ userId, taxYear: year, ...values })
    .onConflictDoUpdate({
      target: [taxProfilesTable.userId, taxProfilesTable.taxYear],
      set: { ...values, updatedAt: new Date().toISOString() }
    })
    .returning();

  return toTaxProfile(row);
};
