import { expect, test } from './fixtures/test';
import { createE2eAccount, signIn } from './utils/accounts';
import { createInvoiceTestData } from './utils/test-data';

test('a signed-in freelancer cannot read or change another account’s records', async ({
  browser,
  freelancer: owner,
  invoiceForm,
  invoicesPage,
  page
}) => {
  const invoice = createInvoiceTestData('Isolated invoice');
  await invoiceForm.createDraft(invoice);
  await invoicesPage
    .rowFor(invoice.recipientName)
    .getByRole('link', { name: 'View invoice' })
    .click();
  await expect(page).toHaveURL(/\/invoices\/\d+$/);
  const invoiceId = Number(new URL(page.url()).pathname.split('/').at(-1));

  const clientResponse = await page.request.post(`/api/${owner.id}/clients`, {
    data: {
      name: `Isolated client ${invoiceId}`,
      type: 'receiver',
      businessType: 'business',
      businessNumber: `ISO${invoiceId}`,
      address: 'Vilnius',
      email: `isolated-${invoiceId}@example.com`
    }
  });
  expect(clientResponse.status()).toBe(201);
  const { client } = await clientResponse.json();

  const expenseResponse = await page.request.post(`/api/${owner.id}/expenses`, {
    data: {
      expenseDate: '2026-01-15',
      supplier: `Isolated supplier ${invoiceId}`,
      description: 'Software subscription',
      category: 'software',
      totalAmount: '10.00',
      businessUsePercentage: '100'
    }
  });
  expect(expenseResponse.status()).toBe(201);
  const { expense } = await expenseResponse.json();

  const ownerResources = [
    `invoices/${invoiceId}`,
    `invoices/${invoiceId}/workspace`,
    `clients/${client.id}`,
    `clients/${client.id}/workspace`,
    `expenses/${expense.id}`,
    `expenses/${expense.id}/attachments`
  ];

  const intruder = await createE2eAccount('intruder');
  const intruderContext = await browser.newContext({ locale: 'en-US' });

  try {
    const intruderPage = await intruderContext.newPage();
    await signIn(intruderPage, intruder);
    const { request } = intruderPage;

    for (const resource of ownerResources) {
      expect(
        (await request.get(`/api/${owner.id}/${resource}`)).status(),
        `owner URL ${resource}`
      ).toBe(401);
      expect(
        (await request.get(`/api/${intruder.id}/${resource}`)).status(),
        `own URL with owner's IDs ${resource}`
      ).toBe(404);
    }

    expect(
      (
        await request.delete(`/api/${intruder.id}/expenses/${expense.id}`)
      ).status()
    ).toBe(404);
    expect(
      (
        await request.delete(`/api/${intruder.id}/clients/${client.id}`)
      ).status()
    ).toBe(404);
    expect(
      (await request.delete(`/api/${owner.id}/invoices/${invoiceId}`)).status()
    ).toBe(401);

    await intruderPage.goto(`/invoices/${invoiceId}`);
    await expect(intruderPage.getByText(invoice.recipientName)).toHaveCount(0);
  } finally {
    await intruderContext.close();
  }

  for (const resource of ownerResources) {
    expect(
      (await page.request.get(`/api/${owner.id}/${resource}`)).status(),
      `owner still reads ${resource}`
    ).toBe(200);
  }
});
