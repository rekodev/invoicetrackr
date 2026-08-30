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

const parseScaledDecimal = (
  value: number | string | null | undefined,
  scale: number
) => {
  const decimal = String(value ?? 0).trim();
  const match = decimal.match(/^(\d+)(?:\.(\d+))?$/);

  if (!match) return 0n;

  const factor = 10n ** BigInt(scale);
  const fraction = (match[2] || '').padEnd(scale, '0').slice(0, scale);

  return BigInt(match[1]) * factor + BigInt(fraction || '0');
};

const roundPositiveDivision = (value: bigint, divisor: bigint) =>
  (value + divisor / 2n) / divisor;

const toMoney = (amountInCents: bigint) =>
  `${amountInCents / 100n}.${String(amountInCents % 100n).padStart(2, '0')}`;

export const calculateInvoiceTotals = (
  services: Array<Pick<InvoiceServiceBody, 'amount' | 'quantity' | 'vatRate'>>
) => {
  const totals = services.reduce(
    (acc, service) => {
      const subtotalCents = roundPositiveDivision(
        parseScaledDecimal(service.amount, 2) *
          parseScaledDecimal(service.quantity, 4),
        10_000n
      );
      const vatCents = roundPositiveDivision(
        subtotalCents * parseScaledDecimal(service.vatRate, 2),
        10_000n
      );

      return {
        subtotalCents: acc.subtotalCents + subtotalCents,
        vatCents: acc.vatCents + vatCents
      };
    },
    { subtotalCents: 0n, vatCents: 0n }
  );

  return {
    subtotalAmount: toMoney(totals.subtotalCents),
    vatAmount: toMoney(totals.vatCents),
    totalAmount: toMoney(totals.subtotalCents + totals.vatCents)
  };
};
