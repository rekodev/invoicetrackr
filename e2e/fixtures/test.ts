import { test as base } from '@playwright/test';

import { InvoiceFormPage } from '../pages/invoice-form.page';
import { InvoicesPage } from '../pages/invoices.page';

type InvoiceFixtures = {
  invoiceForm: InvoiceFormPage;
  invoicesPage: InvoicesPage;
};

export const test = base.extend<InvoiceFixtures>({
  invoiceForm: async ({ page }, use) => {
    await use(new InvoiceFormPage(page));
  },
  invoicesPage: async ({ page }, use) => {
    await use(new InvoicesPage(page));
  }
});

export { expect } from '@playwright/test';
