import { expect, test } from '@playwright/test';
import bcrypt from 'bcryptjs';

import { ANALYTICS_CONSENT_COOKIE } from '../client/src/lib/analytics/constants';
import {
  completeUserOnboardingInDb,
  deleteUserFromDb,
  getUserByEmailFromDb,
  registerUser
} from '../server/src/database/user';
import { LoginPage } from './pages/login.page';

const accountUser = {
  email: 'delete-me.e2e@example.com',
  password: 'Playwright1!'
};

test.use({ storageState: { cookies: [], origins: [] } });

test('exports account data, then deletes the account after email confirmation', async ({
  page
}) => {
  const existingUser = await getUserByEmailFromDb(accountUser.email);
  if (existingUser?.id) await deleteUserFromDb(existingUser.id);

  const user = await registerUser({
    email: accountUser.email,
    password: await bcrypt.hash(accountUser.password, 10),
    language: 'en',
    emailVerifiedAt: new Date().toISOString()
  });
  if (!user) throw new Error('Unable to seed the account E2E user');
  await completeUserOnboardingInDb(user.id);

  await page.context().addCookies([
    {
      name: ANALYTICS_CONSENT_COOKIE,
      value: 'declined',
      url: process.env.E2E_BASE_URL || 'http://127.0.0.1:3100',
      sameSite: 'Lax'
    }
  ]);
  await new LoginPage(page).login(accountUser.email, accountUser.password);
  await page.goto('/settings/account-settings');

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download My Data' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(
    /^invoicetrackr-data-\d{4}-\d{2}-\d{2}\.zip$/
  );

  await page.getByRole('button', { name: 'Delete Account' }).click();
  const dialog = page.getByRole('dialog', { name: 'Delete Account' });
  await expect(dialog.getByText('Removed Right Away')).toBeVisible();

  const deleteButton = dialog.getByRole('button', {
    name: 'Delete My Account'
  });
  await expect(deleteButton).toBeDisabled();
  await dialog
    .getByLabel(`Type ${accountUser.email} to confirm`)
    .fill(accountUser.email);
  await deleteButton.click();

  await expect(page).not.toHaveURL(/\/settings\//);
  await expect.poll(() => getUserByEmailFromDb(accountUser.email)).toBeFalsy();
});
