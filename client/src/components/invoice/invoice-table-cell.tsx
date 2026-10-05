'use client';

import { buttonVariants, Chip } from '@heroui/react';
import type { InvoiceListItem } from '@invoicetrackr/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { INVOICE_WORKSPACE_PAGE } from '@/lib/constants/pages';
import { formatDate } from '@/lib/utils/date';
import { getInvoiceDueStatus, getInvoicePaymentStatus } from '@/lib/utils/invoice';

type Props = { invoice: InvoiceListItem; columnKey: string };

export default function InvoiceTableCell({ invoice, columnKey }: Props) {
  const t = useTranslations('invoices.table');
  const actions = useTranslations('invoices.cell.actions');
  const href = INVOICE_WORKSPACE_PAGE(Number(invoice.id));
  const lifecycle = invoice.lifecycleStatus || 'draft';
  const paymentStatus = getInvoicePaymentStatus(invoice);
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
    case 'totalAmount': {
      const symbol = (invoice.currency || 'eur') === 'eur' ? '€' : '$';
      return (
        <span className="tabular-nums">{symbol}{Number(invoice.totalAmount).toFixed(2)}</span>
      );
    }
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
      if (lifecycle !== 'issued') return <span className="text-muted">—</span>;
      return (
        <div className="flex flex-wrap gap-1">
          <Chip variant="soft" color={paymentStatus === 'paid' ? 'success' : 'warning'}>
            {t(`status.${paymentStatus}`)}
          </Chip>
          {dueStatus.isPastDue ? (
            <Chip variant="soft" color="danger">{actions('past_due', { days: dueStatus.daysPastDue })}</Chip>
          ) : null}
        </div>
      );
    case 'actions':
      return (
        <Link
          href={href}
          className={buttonVariants({ size: 'sm', variant: 'secondary' })}
        >
          {actions('tooltip_view')}
        </Link>
      );
    default:
      return null;
  }
}
