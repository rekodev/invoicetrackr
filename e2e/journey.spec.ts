import { getInvoiceDeliveriesFromDb } from '../server/src/database/email-delivery';
import { expect, test } from './fixtures/test';

test.use({ onboarded: false });

test('a new freelancer sets up, invoices a client, gets paid, logs an expense, and exports the journal', async ({
  freelancer,
  invoiceForm,
  invoicesPage,
  page
}) => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const clientName = `Journey Client ${suffix}`;
  const clientEmail = `journey-${suffix}@example.com`;
  const supplier = `Journey Supplier ${suffix}`;
  const today = new Date().toISOString().slice(0, 10);
  const [year, month] = today.split('-').map(Number);

  await page.getByLabel('Legal name').fill(freelancer.name);
  await page
    .getByLabel('Individual Activity Certificate No.')
    .fill(freelancer.businessNumber);
  await page.getByLabel('Invoice Email').fill(freelancer.email);
  await page.getByLabel('Address').fill(freelancer.address);
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Skip for Now' }).click();
  await page.getByRole('button', { name: 'Finish setup' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText('Your Workbench Is Empty')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Invoices' })).toBeVisible();

  await page.goto('/clients');
  await page.getByRole('button', { name: 'Add New' }).click();
  const clientDialog = page.getByRole('dialog', { name: 'Add New Client' });
  await clientDialog
    .getByRole('combobox', { name: 'Company name' })
    .fill(clientName);
  await clientDialog.getByLabel('Business Number').fill('305000100');
  await clientDialog.getByLabel('Address').fill('Konstitucijos pr. 7, Vilnius');
  await clientDialog.getByLabel('Email').fill(clientEmail);
  await clientDialog.getByRole('button', { name: 'Add', exact: true }).click();
  await expect(clientDialog).toHaveCount(0);

  await page.getByRole('link', { name: new RegExp(clientName) }).click();
  await expect(page).toHaveURL(/\/clients\/\d+$/);
  await page.getByRole('link', { name: 'Create Invoice' }).first().click();
  await expect(page).toHaveURL(/\/invoices\/new\?clientId=\d+$/);
  await invoiceForm.fillServicesAndSave({
    serviceDescription: `Consulting ${suffix}`,
    quantity: '2',
    unitPrice: '125'
  });

  await invoicesPage
    .rowFor(clientName)
    .getByRole('link', { name: 'View invoice' })
    .click();
  await page.getByRole('button', { name: 'Issue Invoice' }).click();
  await page
    .getByRole('dialog', { name: 'Issue Invoice' })
    .getByRole('button', { name: 'Issue Invoice' })
    .click();
  const numberHeading = page.getByRole('heading', { name: /^SF\d+/ });
  await expect(numberHeading).toBeVisible();
  const number = (await numberHeading.textContent())!.trim();
  const invoiceId = Number(new URL(page.url()).pathname.split('/').at(-1));

  await page.getByRole('button', { name: 'Send invoice' }).click();
  const emailDialog = page.getByRole('dialog');
  await expect(emailDialog.getByLabel('Recipient Email')).toHaveValue(
    clientEmail
  );
  await emailDialog.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Email history' })
  ).toBeVisible();
  await expect(page.getByText(/^Accepted for sending ·/)).toBeVisible();
  const [delivery] = await getInvoiceDeliveriesFromDb(freelancer.id, invoiceId);
  expect(delivery).toMatchObject({ recipient: clientEmail, status: 'sent' });
  expect(delivery.providerMessageId).toMatch(/^captured_/);

  await page.getByRole('button', { name: 'Record payment' }).click();
  const paymentDialog = page.getByRole('dialog', { name: 'Record payment' });
  await paymentDialog.getByLabel('Payment date').fill(today);
  await paymentDialog.getByRole('button', { name: 'Save payment' }).click();
  await expect(page.getByText('Paid', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Record payment' })
  ).toHaveCount(0);

  await page.goto('/expenses');
  await page.getByRole('button', { name: 'Add Expense' }).first().click();
  const expenseDialog = page.getByRole('dialog', { name: 'Add Expense' });
  await expenseDialog.getByLabel('Supplier').fill(supplier);
  await expenseDialog.getByLabel('Description').fill('Laptop stand');
  await expenseDialog.getByLabel('Total Amount').fill('49.90');
  await expenseDialog.getByRole('button', { name: 'Add Expense' }).click();
  await expect(expenseDialog).toHaveCount(0);
  await expect(
    page.getByRole('row').filter({ hasText: supplier })
  ).toContainText('Missing');

  await page.goto('/dashboard');
  await expect(page.getByText('Your Workbench Is Empty')).toHaveCount(0);
  await expect(page.getByText('Needs Attention')).toBeVisible();
  await expect(
    page.getByText('1 expense this year has no document')
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Review expenses' })
  ).toBeVisible();

  await page.goto(`/reports/journal?year=${year}&month=${month}`);
  await expect(
    page.getByRole('link', { name: `Open invoice ${number}` })
  ).toBeVisible();
  const csvExport = await page.request.get(
    `/reports/journal/export?year=${year}&month=${month}&format=csv`
  );
  expect(csvExport.status()).toBe(200);
  expect(await csvExport.text()).toContain(`"${number}","${clientName}`);
});
