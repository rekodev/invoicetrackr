import { fromCents, toCents } from './money';

type ClientInvoiceRow = {
  id: number;
  invoiceId: string | null;
  date: string;
  dueDate: string;
  lifecycleStatus: string;
  status: string;
  totalAmount: string;
  paidAmount: string;
};

export const summarizeClientInvoices = (rows: Array<ClientInvoiceRow>) => {
  let invoiced = 0n;
  let paid = 0n;
  const invoices = rows.map((row) => {
    const counts = row.lifecycleStatus === 'issued';
    const received = counts ? toCents(row.paidAmount) : 0n;
    const outstanding = counts ? toCents(row.totalAmount) - received : 0n;
    if (counts) {
      invoiced += toCents(row.totalAmount);
      paid += received;
    }
    return {
      ...row,
      paidAmount: counts ? fromCents(received) : null,
      outstandingAmount: counts ? fromCents(outstanding) : null
    };
  });

  return {
    totals: {
      invoicedAmount: fromCents(invoiced),
      paidAmount: fromCents(paid),
      outstandingAmount: fromCents(invoiced - paid)
    },
    invoices
  };
};
