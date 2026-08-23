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
      .getByRole('textbox', { name: 'Description', exact: true })
      .first()
      .fill(invoice.serviceDescription);
    await this.page
      .getByRole('spinbutton', { name: 'Quantity', exact: true })
      .first()
      .fill(invoice.quantity);
    await this.page
      .getByRole('spinbutton', { name: 'Unit price', exact: true })
      .first()
      .fill(invoice.unitPrice);
    const noPaymentRadio = this.page.getByRole('radio', {
      name: 'No payment block'
    });
    await this.page.getByText('No payment block', { exact: true }).click();
    await expect(noPaymentRadio).toBeChecked();
    await this.page.getByRole('button', { name: /^Save$/ }).click();

    await expect(this.page).toHaveURL(/\/invoices$/);
  }
}
