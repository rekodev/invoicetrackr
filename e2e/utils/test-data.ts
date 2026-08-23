export const e2eUser = {
  email: 'freelancer.e2e@example.com',
  password: 'Playwright1!',
  name: 'E2E Freelancer',
  businessNumber: 'IV-E2E-001',
  address: 'Gedimino pr. 1, Vilnius'
};

export type InvoiceTestData = {
  recipientName: string;
  recipientBusinessNumber?: string;
  recipientAddress?: string;
  recipientEmail?: string;
  serviceDescription: string;
  quantity: string;
  unitPrice: string;
};

export const createInvoiceTestData = (
  scenario: string,
  overrides: Partial<InvoiceTestData> = {}
): InvoiceTestData => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  return {
    recipientName: `${scenario} ${suffix}`,
    serviceDescription: `Consulting ${suffix}`,
    quantity: '2',
    unitPrice: '125',
    ...overrides
  };
};
