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

    await row.getByRole('button', { name: 'More Actions' }).click();
    await this.page
      .getByRole('menuitem', { name: 'Request Recipient Details' })
      .click();
    await expect(
      this.page.getByRole('heading', { name: 'Request Recipient Details' })
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'Copy Link' }).click();

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
      .getByRole('button', { name: 'More Actions' })
      .click();
    await this.page.getByRole('menuitem', { name: 'Edit Invoice' }).click();
    await expect(this.page).toHaveURL(/\/invoices\/edit\/\d+$/);
  }

  private async readClipboard() {
    return this.page.evaluate(() => navigator.clipboard.readText());
  }
}
