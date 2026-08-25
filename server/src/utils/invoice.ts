import type { InvoiceServiceBody } from '@invoicetrackr/types';

export type InvoiceTotals = {
  subtotalAmount: string;
  vatAmount: string;
  totalAmount: string;
};

type InvoiceTotalService = Omit<
  Pick<InvoiceServiceBody, 'amount' | 'quantity' | 'vatRate'>,
  'amount' | 'vatRate'
> & {
  amount: number | string;
  vatRate?: number | string | null;
};

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
  services: Array<InvoiceTotalService>
): InvoiceTotals => {
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

export const positionInvoiceServices = <T extends object>(services: Array<T>) =>
  services.map((service, position) => ({ ...service, position }));
