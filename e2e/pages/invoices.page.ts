import { expect, type Locator, type Page } from '@playwright/test';

export class InvoicesPage {
  constructor(private readonly page: Page) {}

  rowFor(recipientName: string): Locator {
    return this.page.getByRole('row').filter({ hasText: recipientName });
  }

  async expectLifecycle(recipientName: string, lifecycle: 'Draft' | 'Issued') {
    const row = this.rowFor(recipientName);

    await expect(row).toBeVisible();
    await expect(row).toContainText(lifecycle);
  }

  async copyRecipientDetailsLink(recipientName: string) {
    const row = this.rowFor(recipientName);

    await row
      .locator('button[aria-label="Request recipient details"]')
      .click();
    await expect(
      this.page.getByRole('heading', { name: 'Request recipient details' })
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'Copy link' }).click();

    await expect.poll(() => this.readClipboard()).toMatch(
      /\/invoices\/details\/[a-f0-9]+$/
    );

    return this.readClipboard();
  }

  async expectIssuedNumber(recipientName: string) {
    await expect(this.rowFor(recipientName)).toContainText(/SF\d{3}/);
  }

  async openDraftForEditing(recipientName: string) {
    await this.rowFor(recipientName)
      .locator('button[aria-label="Edit invoice"]')
      .click();
    await expect(this.page).toHaveURL(/\/invoices\/edit\/\d+$/);
  }

  private async readClipboard() {
    return this.page.evaluate(() => navigator.clipboard.readText());
  }
}
