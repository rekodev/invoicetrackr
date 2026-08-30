import { expect, test } from './fixtures/test';
import { RecipientDetailsPage } from './pages/recipient-details.page';
import { createInvoiceTestData } from './utils/test-data';

test.describe('invoices', () => {
  test('creates a draft invoice', async ({ invoiceForm, invoicesPage }) => {
    const invoice = createInvoiceTestData('Draft recipient', {
      recipientBusinessNumber: '305000001',
      recipientAddress: 'Konstitucijos pr. 7, Vilnius',
      recipientEmail: 'draft.recipient@example.com',
      serviceDate: '2026-08-20',
      notes: 'Thank you for your business.',
      secondServiceDescription: 'Implementation workshop'
    });

    await invoiceForm.createDraft(invoice);
    await invoicesPage.expectLifecycle(invoice.recipientName, 'Draft');
    await invoicesPage.openDraftForEditing(invoice.recipientName);
    await invoiceForm.expectPersistedDraft(invoice);
  });

  test('recipient completion issues the draft', async ({
    browser,
    invoiceForm,
    invoicesPage,
    page
  }) => {
    const invoice = createInvoiceTestData('Recipient link');

    await invoiceForm.createDraft(invoice);
    await invoicesPage.expectLifecycle(invoice.recipientName, 'Draft');
    const recipientUrl = await invoicesPage.copyRecipientDetailsLink(
      invoice.recipientName
    );

    const recipientContext = await browser.newContext({ locale: 'en-US' });
    const recipientPage = await recipientContext.newPage();
    const recipientDetails = new RecipientDetailsPage(recipientPage);

    try {
      await recipientPage.goto(recipientUrl);
      await recipientDetails.complete({
        businessNumber: '305000002',
        address: 'Laisves al. 10, Kaunas'
      });
    } finally {
      await recipientContext.close();
    }

    await page.goto('/invoices');
    await invoicesPage.expectLifecycle(invoice.recipientName, 'Issued');
    await invoicesPage.expectIssuedNumber(invoice.recipientName);
    await expect(page.getByText(invoice.recipientName)).toBeVisible();
  });
});
