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

  test('uses the workspace to issue an invoice and record a partial payment', async ({
    invoiceForm,
    invoicesPage,
    page
  }) => {
    const invoice = createInvoiceTestData('Workspace payment', {
      recipientBusinessNumber: '305000003',
      recipientAddress: 'Vilniaus g. 1, Vilnius',
      recipientEmail: 'workspace.recipient@example.com'
    });

    await invoiceForm.createDraft(invoice);
    const row = invoicesPage.rowFor(invoice.recipientName);
    await row.getByRole('link', { name: 'View', exact: true }).click();
    await expect(page).toHaveURL(/\/invoices\/\d+$/);
    await expect(
      page.getByRole('heading', { name: 'Draft invoice' })
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Actions' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Payments' })).toHaveCount(
      0
    );
    await expect(
      page.getByRole('heading', { name: 'Email history' })
    ).toHaveCount(0);

    await page.getByRole('button', { name: 'Issue Invoice' }).click();
    const issueDialog = page.getByRole('dialog', { name: 'Issue Invoice' });
    await expect(issueDialog).toBeVisible();
    await issueDialog.getByRole('button', { name: 'Issue Invoice' }).click();

    await expect(page.getByRole('heading', { name: /^SF\d+/ })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Record payment' })
    ).toBeVisible();
    await page.getByRole('button', { name: 'Record payment' }).click();
    const paymentDialog = page.getByRole('dialog', { name: 'Record payment' });
    await expect(paymentDialog).toBeVisible();
    await paymentDialog
      .getByRole('spinbutton', { name: 'Amount received' })
      .fill('50');
    await paymentDialog.getByRole('button', { name: 'Save payment' }).click();

    await expect(page.getByRole('heading', { name: 'Payments' })).toBeVisible();
    await expect(page.getByText('€50.00')).toHaveCount(2);
    await expect(page.getByText('€200.00')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Email history' })
    ).toHaveCount(0);

    await page
      .getByRole('button', { name: 'Edit payment', exact: true })
      .click();
    const editDialog = page.getByRole('dialog', { name: 'Edit payment' });
    await editDialog
      .getByRole('spinbutton', { name: 'Amount received' })
      .fill('75');
    await editDialog.getByRole('button', { name: 'Save payment' }).click();
    await expect(page.getByText('€75.00')).toHaveCount(2);
    await expect(page.getByText('€175.00')).toBeVisible();

    await page
      .getByRole('button', { name: 'Remove payment', exact: true })
      .click();
    await page
      .getByRole('dialog', { name: 'Remove this payment?' })
      .getByRole('button', { name: 'Remove payment', exact: true })
      .click();
    await expect(page.getByRole('heading', { name: 'Payments' })).toHaveCount(
      0
    );
    await expect(page.getByText('€250.00')).toBeVisible();
  });
});
