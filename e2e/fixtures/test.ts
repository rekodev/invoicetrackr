import { test as base } from '@playwright/test';

import { InvoiceFormPage } from '../pages/invoice-form.page';
import { InvoicesPage } from '../pages/invoices.page';
import { createE2eAccount, type E2eAccount, signIn } from '../utils/accounts';

type Fixtures = {
  onboarded: boolean;
  freelancer: E2eAccount;
  invoiceForm: InvoiceFormPage;
  invoicesPage: InvoicesPage;
};

export const test = base.extend<Fixtures>({
  onboarded: [true, { option: true }],
  freelancer: [
    async ({ page, onboarded }, use) => {
      const account = await createE2eAccount('freelancer', { onboarded });
      await signIn(page, account, onboarded ? /\/dashboard$/ : /\/onboarding$/);
      await use(account);
    },
    { auto: true }
  ],
  invoiceForm: async ({ page }, use) => {
    await use(new InvoiceFormPage(page));
  },
  invoicesPage: async ({ page }, use) => {
    await use(new InvoicesPage(page));
  }
});

export { expect } from '@playwright/test';
