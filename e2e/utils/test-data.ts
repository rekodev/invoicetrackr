export type InvoiceTestData = {
  recipientName: string;
  recipientBusinessNumber?: string;
  recipientAddress?: string;
  recipientEmail?: string;
  serviceDescription: string;
  secondServiceDescription?: string;
  serviceDate?: string;
  notes?: string;
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
