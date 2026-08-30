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

    if (invoice.serviceDate) {
      await this.page.getByLabel('Service date').fill(invoice.serviceDate);
    }

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

    if (invoice.secondServiceDescription) {
      await this.page.getByRole('button', { name: 'Add Service' }).click();
      await this.page
        .getByRole('textbox', { name: 'Description', exact: true })
        .nth(1)
        .fill(invoice.secondServiceDescription);
      await this.page
        .getByRole('spinbutton', { name: 'Quantity', exact: true })
        .nth(1)
        .fill('1.25');
      await this.page
        .getByRole('spinbutton', { name: 'Unit price', exact: true })
        .nth(1)
        .fill('80.40');
      await this.page
        .getByRole('button', { name: 'Move service up' })
        .nth(1)
        .click();
    }

    if (invoice.notes) {
      await this.page
        .getByPlaceholder('Optional information shown on the invoice')
        .fill(invoice.notes);
    }

    if (invoice.secondServiceDescription) {
      await this.page.getByRole('button', { name: 'Preview' }).click();
      await expect(this.page.getByRole('dialog')).toBeVisible();
      await this.page.getByRole('button', { name: 'Close' }).last().click();
    }
    const noPaymentRadio = this.page.getByRole('radio', {
      name: 'No Payment Block'
    });
    await this.page.getByText('No Payment Block', { exact: true }).click();
    await expect(noPaymentRadio).toBeChecked();
    await this.page.getByRole('button', { name: /^Save$/ }).click();

    await expect(this.page).toHaveURL(/\/invoices$/);
  }

  async expectPersistedDraft(invoice: InvoiceTestData) {
    await expect(
      this.page.getByRole('form', { name: 'Add New Invoice Form' })
    ).toBeVisible();

    if (invoice.serviceDate) {
      await expect(this.page.getByLabel('Service date')).toHaveValue(
        invoice.serviceDate
      );
    }

    if (invoice.notes) {
      await expect(
        this.page.getByPlaceholder('Optional information shown on the invoice')
      ).toHaveValue(invoice.notes);
    }

    if (invoice.secondServiceDescription) {
      const descriptions = this.page.getByRole('textbox', {
        name: 'Description',
        exact: true
      });
      await expect(descriptions.nth(0)).toHaveValue(
        invoice.secondServiceDescription
      );
      await expect(descriptions.nth(1)).toHaveValue(invoice.serviceDescription);
    }
  }
}
