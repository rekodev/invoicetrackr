import type { InvoiceBody } from '@invoicetrackr/types';

import { calculateInvoiceTotals } from '@/lib/utils';
import { addDaysToDate } from '@/lib/utils/date';

export const getDueDateAfterIssueDateChange = ({
  issueDate,
  currentDueDate,
  paymentTermsDays,
  isManuallyOverridden
}: {
  issueDate: string;
  currentDueDate: string;
  paymentTermsDays: number;
  isManuallyOverridden: boolean;
}) =>
  issueDate && !isManuallyOverridden
    ? addDaysToDate(issueDate, paymentTermsDays)
    : currentDueDate;

export const buildInvoicePreviewData = (formData: InvoiceBody): InvoiceBody => {
  const totals = calculateInvoiceTotals(formData.services);

  return {
    ...formData,
    serviceDate: formData.serviceDate || formData.date,
    lifecycleStatus: 'draft',
    services: formData.services.map((service, position) => ({
      ...service,
      position
    })),
    subtotalAmount: totals.subtotalAmount,
    vatAmount: totals.vatAmount,
    totalAmount: totals.totalAmount
  };
};
