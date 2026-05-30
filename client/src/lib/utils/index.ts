import type { InvoiceServiceBody } from '@invoicetrackr/types';

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const validateInvoiceId = (invoiceId: string) => {
  const regex = /^[A-Za-z]{2,8}[1-9][0-9]*$/;
  return regex.test(invoiceId);
};

export const splitInvoiceId = (invoiceId: string) => {
  const match = invoiceId?.match(/^([A-Za-z]{2,8})([0-9]+)$/);

  if (!match) return [invoiceId || '', ''];

  const series = match[1];
  const number = match[2];

  return [series, number];
};

export const getDaysUntilDueDate = (date: string, dueDate: string) => {
  const date1 = new Date(date);
  const date2 = new Date(dueDate);

  const diffTime = date2.getTime() - date1.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  return diffDays;
};

export const calculateServiceTotal = (services: Array<InvoiceServiceBody>) =>
  Number(calculateInvoiceTotals(services).totalAmount);

const toMoney = (amountInCents: number) => (amountInCents / 100).toFixed(2);

export const calculateInvoiceTotals = (
  services: Array<Pick<InvoiceServiceBody, 'amount' | 'quantity' | 'vatRate'>>
) => {
  const totals = services.reduce(
    (acc, service) => {
      const subtotalCents = Math.round(
        Number(service.amount) * Number(service.quantity) * 100
      );
      const vatCents = Math.round(
        subtotalCents * (Number(service.vatRate ?? 0) / 100)
      );

      return {
        subtotalCents: acc.subtotalCents + subtotalCents,
        vatCents: acc.vatCents + vatCents
      };
    },
    { subtotalCents: 0, vatCents: 0 }
  );

  return {
    subtotalAmount: toMoney(totals.subtotalCents),
    vatAmount: toMoney(totals.vatCents),
    totalAmount: toMoney(totals.subtotalCents + totals.vatCents)
  };
};
