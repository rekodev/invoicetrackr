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

const toCents = (value: string) => {
  const negative = value.startsWith('-');
  const [whole, fraction = ''] = (negative ? value.slice(1) : value).split('.');
  const cents = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0').slice(0, 2));
  return negative ? -cents : cents;
};

const fromCents = (value: bigint) => {
  const absolute = value < 0n ? -value : value;
  return `${value < 0n ? '-' : ''}${absolute / 100n}.${(absolute % 100n).toString().padStart(2, '0')}`;
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
