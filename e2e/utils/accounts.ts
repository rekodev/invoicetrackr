import type { Page } from '@playwright/test';
import bcrypt from 'bcryptjs';

import { ANALYTICS_CONSENT_COOKIE } from '../../client/src/lib/analytics/constants';
import {
  completeUserOnboardingInDb,
  registerUser,
  updateUserInDb
} from '../../server/src/database/user';
import { LoginPage } from '../pages/login.page';

export type E2eAccount = {
  id: number;
  email: string;
  password: string;
  name: string;
  businessNumber: string;
  address: string;
};

const E2E_PASSWORD = 'Playwright1!';

export const createE2eAccount = async (
  label: string,
  { onboarded = true }: { onboarded?: boolean } = {}
): Promise<E2eAccount> => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const account = {
    email: `${label}-${suffix}@e2e.example.com`,
    password: E2E_PASSWORD,
    name: `E2E Freelancer ${suffix}`,
    businessNumber: `IV-${suffix}`,
    address: 'Gedimino pr. 1, Vilnius'
  };

  const user = await registerUser({
    email: account.email,
    password: await bcrypt.hash(account.password, 10),
    language: 'en',
    emailVerifiedAt: new Date().toISOString()
  });
  if (!user) throw new Error(`Unable to seed the ${label} E2E account`);

  if (onboarded) {
    const profile = await updateUserInDb(
      {
        id: user.id,
        name: account.name,
        businessType: 'individual',
        businessNumber: account.businessNumber,
        vatNumber: null,
        isVatPayer: false,
        address: account.address,
        email: account.email,
        invoiceEmail: account.email,
        phone: null
      },
      ''
    );
    if (!profile) throw new Error(`Unable to complete the ${label} profile`);

    const completed = await completeUserOnboardingInDb(user.id);
    if (!completed?.onboardingCompletedAt)
      throw new Error(`Unable to complete ${label} onboarding`);
  }

  return { id: user.id, ...account };
};

export const signIn = async (
  page: Page,
  account: E2eAccount,
  landingUrl: RegExp = /\/dashboard$/
) => {
  await page.context().addCookies([
    {
      name: ANALYTICS_CONSENT_COOKIE,
      value: 'declined',
      url: process.env.E2E_BASE_URL || 'http://127.0.0.1:3100',
      sameSite: 'Lax'
    }
  ]);
  await new LoginPage(page).login(account.email, account.password, landingUrl);
};
