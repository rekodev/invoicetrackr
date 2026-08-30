import { expect, type Page } from '@playwright/test';

export class RecipientDetailsPage {
  constructor(private readonly page: Page) {}

  async complete({
    businessNumber,
    address
  }: {
    businessNumber: string;
    address: string;
  }) {
    await expect(
      this.page.getByRole('heading', {
        name: 'Complete Your Billing Details'
      })
    ).toBeVisible();
    await this.page.getByLabel('Company Code').fill(businessNumber);
    await this.page.getByLabel('Address').fill(address);
    await this.page
      .getByRole('button', { name: 'Confirm Details and Receive Invoice' })
      .click();

    await expect(this.page).toHaveURL(/\/invoices\/public\/[a-f0-9]+$/);
    await expect(
      this.page.getByRole('heading', { name: /Invoice Received From/ })
    ).toBeVisible();
    await expect(this.page.getByText(/SF\d{3}/).first()).toBeVisible();
  }
}
