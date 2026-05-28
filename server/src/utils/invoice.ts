import type { InvoiceServiceBody } from '@invoicetrackr/types';

export type InvoiceTotals = {
  subtotalAmount: string;
  vatAmount: string;
  totalAmount: string;
};

type InvoiceTotalService = Pick<
  InvoiceServiceBody,
  'amount' | 'quantity' | 'vatRate'
>;

const toMoney = (amountInCents: number) => (amountInCents / 100).toFixed(2);

export const calculateInvoiceTotals = (
  services: Array<InvoiceTotalService>
): InvoiceTotals => {
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
