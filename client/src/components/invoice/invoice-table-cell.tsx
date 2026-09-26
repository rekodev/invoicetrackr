'use client';

import { EyeIcon } from '@heroicons/react/24/outline';
import { buttonVariants, Chip } from '@heroui/react';
import type { InvoiceBody } from '@invoicetrackr/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { INVOICE_WORKSPACE_PAGE } from '@/lib/constants/pages';
import { formatDate } from '@/lib/utils/date';
import { getInvoiceDueStatus } from '@/lib/utils/invoice';

type Props = { invoice: InvoiceBody; columnKey: string };

export default function InvoiceTableCell({ invoice, columnKey }: Props) {
  const t = useTranslations('invoices.table');
  const actions = useTranslations('invoices.cell.actions');
  const href = INVOICE_WORKSPACE_PAGE(Number(invoice.id));
  const lifecycle = invoice.lifecycleStatus || 'draft';
  const dueStatus = getInvoiceDueStatus(invoice);
  switch (columnKey) {
    case 'id':
      return (
        <Link className="font-medium hover:underline" href={href}>
          {invoice.invoiceId || t('lifecycle_status.draft')}
        </Link>
      );
    case 'receiver':
      return <span>{invoice.receiver.name}</span>;
    case 'totalAmount':
      return (
        <span className="tabular-nums">
          €{Number(invoice.totalAmount).toFixed(2)}
        </span>
      );
    case 'date':
      return <span>{formatDate(invoice.date)}</span>;
    case 'lifecycleStatus':
      return (
        <Chip
          variant="soft"
          color={
            lifecycle === 'voided'
              ? 'danger'
              : lifecycle === 'issued'
                ? 'accent'
                : 'default'
          }
        >
          {t(`lifecycle_status.${lifecycle}`)}
        </Chip>
      );
    case 'status':
      return (
        <Chip
          variant="soft"
          color={
            invoice.status === 'paid'
              ? 'success'
              : invoice.status === 'canceled'
                ? 'danger'
                : 'warning'
          }
        >
          {dueStatus.isPastDue
            ? actions('past_due', { days: dueStatus.daysPastDue })
            : t(`status.${invoice.status}`)}
        </Chip>
      );
    case 'actions':
      return (
        <Link
          href={href}
          className={buttonVariants({ size: 'sm', variant: 'secondary' })}
        >
          <EyeIcon aria-hidden="true" className="size-4" />
          {actions('tooltip_view')}
        </Link>
      );
    default:
      return null;
  }
}
