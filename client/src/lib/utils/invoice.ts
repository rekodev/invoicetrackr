import { InvoiceBody } from '@invoicetrackr/types';

export function getInvoiceDueStatus(invoice: InvoiceBody) {
  function startOfDay(dateValue: string | Date): Date {
    const d = new Date(dateValue);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  const todayStart = startOfDay(new Date());
  const dueDateStart = startOfDay(invoice.dueDate);

  // Past due means: today is after the due date (midnight), i.e., at least 1 calendar day after
  // So, pastDueDate is dueDate + 1 day
  const pastDueDateStart = new Date(
    dueDateStart.getTime() + 24 * 60 * 60 * 1000
  );

  const isPastDue =
    todayStart.getTime() >= pastDueDateStart.getTime() &&
    invoice.status !== 'paid';

  let daysPastDue = 0;

  if (isPastDue) {
    const msPerDay = 24 * 60 * 60 * 1000;
    daysPastDue =
      Math.floor(
        (todayStart.getTime() - pastDueDateStart.getTime()) / msPerDay
      ) + 1;
  }

  return { isPastDue, daysPastDue };
}
