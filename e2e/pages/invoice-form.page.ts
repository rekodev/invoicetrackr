import { expect, type Page } from '@playwright/test';

import type { InvoiceTestData } from '../utils/test-data';

export class InvoiceFormPage {
  constructor(private readonly page: Page) {}

  async createDraft(invoice: InvoiceTestData) {
    await this.page.goto('/invoices/new');
    await expect(
      this.page.getByRole('form', { name: 'Add New Invoice Form' })
    ).toBeVisible();

    await this.page.getByLabel("Receiver's Name").fill(invoice.recipientName);

    if (invoice.recipientBusinessNumber) {
      await this.page
        .getByLabel("Receiver's Company Code")
        .fill(invoice.recipientBusinessNumber);
    }

    if (invoice.recipientAddress) {
      await this.page
        .getByLabel("Receiver's Address")
        .fill(invoice.recipientAddress);
    }

    if (invoice.recipientEmail) {
      await this.page
        .getByLabel("Receiver's Email")
        .fill(invoice.recipientEmail);
    }

    await this.page
      .getByLabel('Description')
      .first()
      .fill(invoice.serviceDescription);
    await this.page.getByLabel('Quantity').first().fill(invoice.quantity);
    await this.page.getByLabel('Unit price').first().fill(invoice.unitPrice);
    await this.page.getByRole('radio', { name: 'No payment block' }).click();
    await this.page.getByRole('button', { name: /^Save$/ }).click();

    await expect(this.page).toHaveURL(/\/invoices$/);
  }
}
