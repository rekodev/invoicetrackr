import { todayInLithuania } from './date';

type PaymentStateInput = {
  lifecycleStatus?: string;
  totalAmount: string;
  paidAmount: string | null;
  outstandingAmount: string | null;
};

export const getInvoicePaymentStatus = (invoice: PaymentStateInput) => {
  const lifecycle = invoice.lifecycleStatus || 'draft';
  if (lifecycle === 'draft' || lifecycle === 'voided') return lifecycle;
  if (Number(invoice.totalAmount) === 0) return 'no_payment_due';
  if (invoice.outstandingAmount === '0.00') return 'paid';
  if (Number(invoice.paidAmount) > 0) return 'partial';
  return 'pending';
};

export function getInvoiceDueStatus(invoice: {
  lifecycleStatus?: string;
  dueDate: string;
  totalAmount: string;
  status?: string;
  outstandingAmount?: string | null;
}, now = new Date()) {
  const today = todayInLithuania(now);
  const outstanding = invoice.outstandingAmount === undefined
    ? invoice.status !== 'paid' && Number(invoice.totalAmount) > 0
    : Number(invoice.outstandingAmount) > 0;
  const isPastDue = (invoice.lifecycleStatus || 'draft') === 'issued' && outstanding && invoice.dueDate < today;
  const daysPastDue = isPastDue
    ? Math.round((Date.parse(today) - Date.parse(invoice.dueDate)) / 86_400_000)
    : 0;
  return { isPastDue, daysPastDue };
}

export const getReminderRecipient = (
  deliveries: Array<{ status: string; recipient: string }>
) =>
  deliveries.find((delivery) => ['sent', 'delivered'].includes(delivery.status))
    ?.recipient;
