import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import { expect, test as setup } from '@playwright/test';
import bcrypt from 'bcryptjs';

import {
  completeUserOnboardingInDb,
  deleteUserFromDb,
  getUserByEmailFromDb,
  registerUser,
  updateUserInDb
} from '../../server/src/database/user';
import { LoginPage } from '../pages/login.page';
import { authFile } from '../utils/paths';
import { e2eUser } from '../utils/test-data';

setup('authenticate completed freelancer', async ({ page }) => {
  const existingUser = await getUserByEmailFromDb(e2eUser.email);
  if (existingUser?.id) await deleteUserFromDb(existingUser.id);

  const user = await registerUser({
    email: e2eUser.email,
    password: await bcrypt.hash(e2eUser.password, 10),
    language: 'en',
    emailVerifiedAt: new Date().toISOString()
  });

  if (!user) throw new Error('Unable to seed the E2E freelancer');

  const updatedUser = await updateUserInDb(
    {
      id: user.id,
      name: e2eUser.name,
      businessType: 'individual',
      businessNumber: e2eUser.businessNumber,
      vatNumber: null,
      isVatPayer: false,
      address: e2eUser.address,
      email: e2eUser.email,
      invoiceEmail: e2eUser.email,
      phone: null
    },
    ''
  );
  if (!updatedUser) throw new Error('Unable to complete the E2E profile');

  const completedUser = await completeUserOnboardingInDb(user.id);
  if (!completedUser?.onboardingCompletedAt)
    throw new Error('Unable to complete E2E onboarding');

  const loginPage = new LoginPage(page);
  await loginPage.login(e2eUser.email, e2eUser.password);

  await expect(page.getByRole('link', { name: 'Invoices' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Payments' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Reports' })).toHaveCount(0);

  await mkdir(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
