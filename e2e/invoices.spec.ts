import { expect, test } from './fixtures/test';
import { RecipientDetailsPage } from './pages/recipient-details.page';
import { createInvoiceTestData } from './utils/test-data';

test.describe('invoices', () => {
  test('creates a draft invoice', async ({
    invoiceForm,
    invoicesPage,
    page
  }) => {
    const reactAriaMessages: string[] = [];
    page.on('console', (message) => {
      const text = message.text();
      const isInvoiceFormRoute =
        page.url().endsWith('/invoices/new') ||
        /\/invoices\/edit\/\d+$/.test(page.url());

      if (!isInvoiceFormRoute) return;

      if (
        text.includes('Cannot change the id of an item') ||
        text.includes('A PressResponder was rendered without a pressable child')
      ) {
        reactAriaMessages.push(text);
      }
    });

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
    expect(reactAriaMessages).toEqual([]);
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
