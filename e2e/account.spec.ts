import { getUserByEmailFromDb } from '../server/src/database/user';
import { expect, test } from './fixtures/test';

test('exports account data, then deletes the account after email confirmation', async ({
  freelancer,
  page
}) => {
  await page.goto('/settings/account');

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
    .getByLabel(`Type ${freelancer.email} to confirm`)
    .fill(freelancer.email);
  await deleteButton.click();

  await expect(page).not.toHaveURL(/\/settings\//);
  await expect.poll(() => getUserByEmailFromDb(freelancer.email)).toBeFalsy();
});
