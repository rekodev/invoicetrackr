import type { ClientWorkspaceResponse, GetInvoiceResponse, InvoiceWorkspaceResponse, JournalResponse } from '../shared/types/src';

import { getUserByEmailFromDb } from '../server/src/database/user';
import { expect, test } from './fixtures/test';
import { RecipientDetailsPage } from './pages/recipient-details.page';
import { createInvoiceTestData, e2eUser } from './utils/test-data';

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

  test('records, settles, edits, and removes receipts with matching client balances and cash-basis reports', async ({
    invoiceForm,
    invoicesPage,
    page
  }) => {
    const invoice = createInvoiceTestData('Workspace payment', {
      recipientBusinessNumber: '305000003',
      recipientAddress: 'Vilniaus g. 1, Vilnius',
      recipientEmail: 'workspace.recipient@example.com',
      secondServiceDescription: 'Additional invoiced work'
    });

    await invoiceForm.createDraft(invoice);
    const row = invoicesPage.rowFor(invoice.recipientName);
    await row.getByRole('link', { name: 'View invoice' }).click();
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

    const workspaceUrl = page.url();
    const invoiceId = Number(new URL(workspaceUrl).pathname.split('/').at(-1));
    const user = await getUserByEmailFromDb(e2eUser.email);
    if (!user) throw new Error('Missing authenticated test user');
    const endpoint = `/api/${user.id}/invoices/${invoiceId}`;
    const clientResponse = await page.request.post(`/api/${user.id}/clients`, {
      data: {
        name: invoice.recipientName,
        type: 'receiver',
        businessType: 'business',
        businessNumber: `E2E${invoiceId}`,
        address: 'Vilnius',
        email: `payments-${invoiceId}@example.com`
      }
    });
    expect(clientResponse.status()).toBe(201);
    const { client } = await clientResponse.json();
    const draft: GetInvoiceResponse = await (await page.request.get(endpoint)).json();
    expect((await page.request.put(endpoint, {
      data: { ...draft.invoice, clientId: client.id, date: '2000-12-01', dueDate: '2000-12-15' }
    })).status()).toBe(200);
    await page.reload();

    await page.getByRole('button', { name: 'Issue Invoice' }).click();
    const issueDialog = page.getByRole('dialog', { name: 'Issue Invoice' });
    await expect(issueDialog).toBeVisible();
    await issueDialog.getByRole('button', { name: 'Issue Invoice' }).click();

    await expect(page.getByRole('heading', { name: /^SF\d+/ })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Record payment' })
    ).toBeVisible();
    const number = await page.getByRole('heading', { name: /^SF\d+/ }).textContent();
    await page.goto('/dashboard');
    await expect(page.getByRole('link', { name: number!, exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: `Send reminder for ${number}` })).toBeVisible();
    await page.goto(workspaceUrl);
    await page.getByRole('button', { name: 'Record payment' }).click();
    const paymentDialog = page.getByRole('dialog', { name: 'Record payment' });
    await expect(paymentDialog).toBeVisible();
    await paymentDialog.getByLabel('Payment date').fill('2000-12-31');
    await paymentDialog
      .getByRole('spinbutton', { name: 'Amount received' })
      .fill('50');
    await paymentDialog.getByRole('button', { name: 'Save payment' }).click();

    await expect(page.getByRole('heading', { name: 'Payments' })).toBeVisible();
    await expect(page.getByText('€50.00')).toHaveCount(2);
    await expect(page.getByText('€300.50')).toBeVisible();
    const journalAmounts = async (year: number) => {
      const journal: JournalResponse = await (await page.request.get(`/api/${user.id}/journal?year=${year}&month=${year === 2000 ? 12 : 1}`)).json();
      return journal.rows.filter((row) => row.documentNumber === number).map((row) => row.amount);
    };
    expect(await journalAmounts(2000)).toEqual(['50.00']);
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
    await expect(page.getByText('€275.50')).toBeVisible();

    await page.getByRole('button', { name: 'Record payment' }).click();
    await paymentDialog.getByLabel('Payment date').fill('2001-01-01');
    await paymentDialog.getByRole('button', { name: 'Save payment' }).click();
    await expect(page.getByText('Paid', { exact: true })).toBeVisible();
    await expect(page.getByText('Fully paid on 2001-01-01')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Record payment' })).toHaveCount(0);
    const settled: InvoiceWorkspaceResponse = await (await page.request.get(`${endpoint}/workspace`)).json();
    expect(new Date(settled.invoice.paidAt!).toISOString()).toBe('2001-01-01T00:00:00.000Z');
    expect(settled.balance).toEqual({ paidAmount: '350.50', outstandingAmount: '0.00' });
    const finalPayment = settled.payments.find((payment) => payment.paymentDate === '2001-01-01')!;
    const correction = await page.request.put(`${endpoint}/payments/${finalPayment.id}`, {
      data: { paymentDate: '2001-01-01', amount: '250.00' }
    });
    expect(correction.status()).toBe(200);
    const corrected: InvoiceWorkspaceResponse = await (await page.request.get(`${endpoint}/workspace`)).json();
    expect(corrected.invoice.paidAt).toBeNull();
    expect(corrected.balance.outstandingAmount).toBe('25.50');
    expect((await page.request.put(`${endpoint}/payments/${finalPayment.id}`, {
      data: { paymentDate: '2001-01-01', amount: '275.50' }
    })).status()).toBe(200);

    const clientWorkspace: ClientWorkspaceResponse = await (await page.request.get(`/api/${user.id}/clients/${client.id}/workspace`)).json();
    expect(clientWorkspace.totals).toEqual({ invoicedAmount: '350.50', paidAmount: '350.50', outstandingAmount: '0.00' });

    expect([...await journalAmounts(2000), ...await journalAmounts(2001)]).toEqual(['75.00', '275.50']);
    await page.goto('/reports?year=2001&month=1');
    await expect(page.getByRole('heading', { name: 'Income and Expense Journal' })).toBeVisible();
    await expect(page.getByRole('link', { name: `Open invoice ${number}` })).toBeVisible();
    const csvExport = await page.request.get('/reports/export?year=2001&month=1&format=csv');
    expect(csvExport.status()).toBe(200);
    expect(csvExport.headers()['content-disposition']).toBe('attachment; filename="income-expense-journal-2001-01.csv"');
    expect(await csvExport.text()).toContain(`"${number}","${invoice.recipientName}`);

    await page.goto('/dashboard');
    await expect(page.getByText('Overdue Invoices', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: `Send reminder for ${number}` })).toHaveCount(0);

    await page.goto('/invoices');
    await expect(invoicesPage.rowFor(invoice.recipientName)).toContainText('€350.50');
    await expect(invoicesPage.rowFor(invoice.recipientName)).toContainText('Paid');
    await expect(invoicesPage.rowFor(invoice.recipientName)).not.toContainText('Received:');
    await expect(invoicesPage.rowFor(invoice.recipientName)).not.toContainText('Remaining:');
    await page.goto(workspaceUrl);

    await page
      .getByRole('button', { name: 'Remove payment', exact: true })
      .first()
      .click();
    await page.getByRole('dialog', { name: 'Remove this payment?' })
      .getByRole('button', { name: 'Remove payment', exact: true }).click();
    await expect(page.getByText('Partially paid', { exact: true })).toBeVisible();
    const reopened: InvoiceWorkspaceResponse = await (await page.request.get(`${endpoint}/workspace`)).json();
    expect(reopened.invoice.paidAt).toBeNull();
    expect(reopened.invoice.status).toBe('pending');
    expect(reopened.balance.outstandingAmount).toBe('275.50');
    const reopenedClient: ClientWorkspaceResponse = await (await page.request.get(`/api/${user.id}/clients/${client.id}/workspace`)).json();
    expect(reopenedClient.totals.outstandingAmount).toBe('275.50');

    await page.getByRole('button', { name: 'Remove payment', exact: true }).click();
    await page.getByRole('dialog', { name: 'Remove this payment?' }).getByRole('button', { name: 'Remove payment', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Payments' }).getByText('No payments recorded yet.')).toBeVisible();
    await expect(page.getByRole('region', { name: 'Payments' }).getByRole('button', { name: 'Record payment' })).toBeVisible();
    await expect(page.getByText('€350.50')).toBeVisible();
    expect([...await journalAmounts(2000), ...await journalAmounts(2001)]).toEqual([]);
  });

  test('serializes competing payments and refuses another owner’s payment IDs', async ({ invoiceForm, invoicesPage, page }) => {
    const invoice = createInvoiceTestData('Concurrent payments', {
      recipientBusinessNumber: '305000004', recipientAddress: 'Vilnius'
    });
    await invoiceForm.createDraft(invoice);
    await invoicesPage.rowFor(invoice.recipientName).getByRole('link', { name: 'View invoice' }).click();
    await page.getByRole('button', { name: 'Issue Invoice' }).click();
    await page.getByRole('dialog', { name: 'Issue Invoice' }).getByRole('button', { name: 'Issue Invoice' }).click();
    await expect(page.getByRole('button', { name: 'Record payment' })).toBeVisible();
    const invoiceId = Number(new URL(page.url()).pathname.split('/').at(-1));
    const user = await getUserByEmailFromDb(e2eUser.email);
    if (!user) throw new Error('Missing authenticated test user');
    const endpoint = `/api/${user.id}/invoices/${invoiceId}`;
    const data = { paymentDate: '2000-01-01', amount: '200.00' };
    const results = await Promise.all([
      page.request.post(`${endpoint}/payments`, { data }),
      page.request.post(`${endpoint}/payments`, { data })
    ]);
    expect(results.map((response) => response.status()).sort()).toEqual([201, 400]);
    const rejected = await results.find((response) => response.status() === 400)!.json();
    expect(rejected.errors[0]).toMatchObject({ key: 'amount', value: expect.stringContaining('50.00') });
    const current: InvoiceWorkspaceResponse = await (await page.request.get(`${endpoint}/workspace`)).json();
    expect(current.payments).toHaveLength(1);
    expect(current.balance).toEqual({ paidAmount: '200.00', outstandingAmount: '50.00' });
    expect((await page.request.post(`${endpoint}/payments`, { data: { ...data, paymentDate: '9999-01-01', amount: '1.00' } })).status()).toBe(400);
    expect((await page.request.put(`/api/${user.id + 1}/invoices/${invoiceId}/payments/${current.payments[0].id}`, { data })).status()).toBe(401);
    expect((await page.request.delete(`${endpoint}/payments/2147483647`)).status()).toBe(404);
  });

  test('keeps a zero-total invoice unpaid without accepting receipts', async ({ invoiceForm, invoicesPage, page }) => {
    const invoice = createInvoiceTestData('No payment due', {
      recipientBusinessNumber: '305000005', recipientAddress: 'Vilnius',
      quantity: '0.0001', unitPrice: '0.01'
    });
    await invoiceForm.createDraft(invoice);
    await invoicesPage.rowFor(invoice.recipientName).getByRole('link', { name: 'View invoice' }).click();
    await expect(page).toHaveURL(/\/invoices\/\d+$/);
    const invoiceId = Number(new URL(page.url()).pathname.split('/').at(-1));
    const user = await getUserByEmailFromDb(e2eUser.email);
    if (!user) throw new Error('Missing authenticated test user');
    const endpoint = `/api/${user.id}/invoices/${invoiceId}`;
    const data = { paymentDate: '2000-01-01', amount: '0.01' };
    expect((await page.request.post(`${endpoint}/payments`, { data })).status()).toBe(400);
    await page.getByRole('button', { name: 'Issue Invoice' }).click();
    await page.getByRole('dialog', { name: 'Issue Invoice' }).getByRole('button', { name: 'Issue Invoice' }).click();
    await expect(page.getByText('No payment due', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Record payment' })).toHaveCount(0);
    expect((await page.request.post(`${endpoint}/payments`, { data })).status()).toBe(400);
    const workspaceResponse = await page.request.get(`${endpoint}/workspace`);
    expect(workspaceResponse.status()).toBe(200);
    const workspace: InvoiceWorkspaceResponse = await workspaceResponse.json();
    expect(workspace.invoice.paidAt).toBeNull();
    expect(workspace.payments).toHaveLength(0);
    expect(workspace.balance).toEqual({ paidAmount: '0.00', outstandingAmount: '0.00' });
  });
});
