'use client';

import {
  Checkbox,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownPopover,
  DropdownTrigger,
  Tooltip,
  toast
} from '@heroui/react';
import {
  ChevronDownIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  EyeIcon,
  LinkIcon,
  PaperAirplaneIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import type { JSX, Key } from 'react';
import { useEffect, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import type {
  InvoiceBody,
  InvoiceLifecycleStatus,
  InvoiceStatus
} from '@invoicetrackr/types';
import { Currency } from '@/lib/types/currency';
import { formatDate } from '@/lib/utils/date';
import { getCurrencySymbol } from '@/lib/utils/currency';
import { getInvoiceDueStatus } from '@/lib/utils/invoice';
import { statusOptions } from '@/lib/constants/table';
import { updateInvoiceStatusAction } from '@/lib/actions/invoice';

const statusColorMap: Record<InvoiceStatus, 'success' | 'danger' | 'warning'> =
  {
    paid: 'success',
    pending: 'warning',
    canceled: 'danger'
  };

const lifecycleStatusColorMap: Record<
  InvoiceLifecycleStatus,
  'default' | 'accent' | 'danger'
> = {
  draft: 'default',
  issued: 'accent',
  voided: 'danger'
};

type Props = {
  userId: number;
  currency: Currency;
  invoice: InvoiceBody;
  columnKey: Key;
  onSendEmail: (_invoice: InvoiceBody) => void;
  onView: (_invoice: InvoiceBody) => void;
  onEdit: (_invoice: InvoiceBody) => void;
  onDelete: (_invoice: InvoiceBody) => void;
  pdfDocument: JSX.Element | null;
};

const InvoiceTableCell = ({
  userId,
  currency,
  invoice,
  columnKey,
  onSendEmail,
  onView,
  onEdit,
  onDelete
}: Props) => {
  const tCell = useTranslations('invoices.cell.actions');
  const tForm = useTranslations('components.invoice_form');
  const tTable = useTranslations('invoices.table');
  const [isPaid, setIsPaid] = useState(invoice.status === 'paid');
  const [isPending, startTransition] = useTransition();

  const { isPastDue, daysPastDue } = getInvoiceDueStatus(invoice);
  const isDraft = (invoice.lifecycleStatus || 'draft') === 'draft';
  const isStripePaid = Boolean(
    invoice.paymentProvider === 'stripe_connect' && invoice.paymentCompletedAt
  );

  const handleViewIconClick = () => onView(invoice);
  const handleEditInvoiceClick = () => onEdit(invoice);
  const handleDeleteInvoiceClick = () => onDelete(invoice);
  const handleCopyPublicLink = async () => {
    if (!invoice.publicInvoiceToken) return;

    const publicLink = `${window.location.origin}/invoices/public/${invoice.publicInvoiceToken}`;
    await navigator.clipboard.writeText(publicLink);

    toast(tCell('public_link_copied'), { variant: 'success' });
  };
  const handleChangeStatus = (
    status: 'paid' | 'pending' | 'canceled' | undefined
  ) => {
    if (isStripePaid) return;
    if (!status || status === invoice.status) return;

    startTransition(async () => {
      const response = await updateInvoiceStatusAction({
        userId,
        invoiceId: Number(invoice.id),
        newStatus: status
      });

      if (!response.ok) setIsPaid((prev) => !prev);

      toast(response.message, {
        variant: response.ok ? 'success' : 'danger'
      });
    });
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsPaid(invoice.status === 'paid');
  }, [invoice.status]);

  const renderTooltip = (content: string, children: JSX.Element) => (
    <Tooltip delay={0}>
      <Tooltip.Trigger>{children}</Tooltip.Trigger>
      <Tooltip.Content>{content}</Tooltip.Content>
    </Tooltip>
  );

  const handleMarkAsPaidClick = () => {
    if (isStripePaid) return;

    setIsPaid(!isPaid);
    handleChangeStatus(isPaid ? 'pending' : 'paid');
  };

  const cellValue =
    invoice[
      columnKey as keyof Omit<
        InvoiceBody,
        | 'actions'
        | 'sender'
        | 'receiver'
        | 'services'
        | 'senderSignature'
        | 'bankingInformation'
      >
    ];

  switch (columnKey as keyof InvoiceBody | 'actions') {
    case 'bankingInformation':
      return;
    case 'senderSignature':
      return;
    case 'sender':
      return;
    case 'services':
      return;
    case 'id':
      return (
        <div className="flex">
          <DocumentTextIcon className="h-5 w-5" />
          &nbsp;
          <p className="text-bold text-sm capitalize">{invoice.invoiceId}</p>
        </div>
      );
    case 'receiver':
      return (
        <div className="flex flex-col">
          <p className="text-bold text-nowrap text-sm capitalize">
            {invoice.receiver.name}
          </p>
        </div>
      );
    case 'totalAmount':
      return (
        <p className="flex gap-0.5">
          <span className="text-success-700">
            {getCurrencySymbol(currency)}
          </span>
          {(Number(invoice.totalAmount) || 0).toFixed(2)}
        </p>
      );
    case 'date':
      return formatDate(cellValue as string) || '';
    case 'lifecycleStatus': {
      const lifecycleStatus = invoice.lifecycleStatus || 'draft';

      return (
        <Chip
          className="capitalize"
          color={lifecycleStatusColorMap[lifecycleStatus]}
          variant="soft"
        >
          {tTable(`lifecycle_status.${lifecycleStatus}`)}
        </Chip>
      );
    }
    case 'status':
      return (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {isStripePaid ? (
              renderTooltip(
                tCell('status_locked'),
                <Chip
                  className="capitalize"
                  color={statusColorMap[invoice.status as InvoiceStatus]}
                  variant="soft"
                >
                  {cellValue as string}
                </Chip>
              )
            ) : (
              <Dropdown>
                <DropdownTrigger
                  isDisabled={isPending}
                  className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 [&[aria-expanded=true]_svg]:rotate-180"
                >
                  <Chip
                    className="capitalize"
                    color={statusColorMap[invoice.status as InvoiceStatus]}
                    variant="soft"
                  >
                    {cellValue as string}
                    <ChevronDownIcon className="ml-0.5 h-3 w-3 transition-transform" />
                  </Chip>
                </DropdownTrigger>
                <DropdownPopover>
                  <DropdownMenu
                    aria-label={tForm('a11y.static_actions_label')}
                    selectionMode="single"
                    items={statusOptions}
                    selectedKeys={[cellValue] as any}
                    onSelectionChange={(key) =>
                      handleChangeStatus(
                        Array.from(key)[0] as
                          | 'paid'
                          | 'pending'
                          | 'canceled'
                          | undefined
                      )
                    }
                  >
                    {(item) => (
                      <DropdownItem key={item.uid}>{item.name}</DropdownItem>
                    )}
                  </DropdownMenu>
                </DropdownPopover>
              </Dropdown>
            )}

            {renderTooltip(
              isStripePaid
                ? tCell('status_locked')
                : isPaid
                  ? tCell('mark_as_pending')
                  : tCell('mark_as_paid'),
              <Checkbox
                className="mr-0.5 max-w-5 p-0"
                isSelected={isPaid}
                onChange={handleMarkAsPaidClick}
                isDisabled={isPending || isStripePaid}
              />
            )}
          </div>

          {isPastDue && (
            <span
              data-testid="invoice-past-due-indicator"
              className="text-danger flex items-center gap-1 text-nowrap text-xs font-medium"
            >
              <ExclamationCircleIcon className="color-danger h-5 w-5" />
              {tCell('past_due', { days: daysPastDue })}
            </span>
          )}
        </div>
      );
    case 'actions':
      return (
        <div className="relative flex items-center justify-end gap-2">
          {renderTooltip(
            tCell('tooltip_send_email'),
            <button
              type="button"
              aria-label={tCell('tooltip_send_email')}
              onClick={() => onSendEmail(invoice)}
              className="text-accent cursor-pointer active:opacity-50"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
            </button>
          )}
          {invoice.publicInvoiceToken &&
            renderTooltip(
              tCell('tooltip_copy_public_link'),
              <button
                type="button"
                aria-label={tCell('tooltip_copy_public_link')}
                onClick={handleCopyPublicLink}
                className="text-muted cursor-pointer text-lg active:opacity-50"
              >
                <LinkIcon className="h-5 w-5" />
              </button>
            )}
          {renderTooltip(
            tCell('tooltip_view'),
            <button
              type="button"
              aria-label={tCell('tooltip_view')}
              onClick={handleViewIconClick}
              className="text-muted cursor-pointer text-lg active:opacity-50"
            >
              <EyeIcon className="h-5 w-5" />
            </button>
          )}
          {isDraft && (
            <>
              {renderTooltip(
                tCell('tooltip_edit'),
                <button
                  type="button"
                  aria-label={tCell('tooltip_edit')}
                  className="text-muted cursor-pointer text-lg active:opacity-50"
                  onClick={handleEditInvoiceClick}
                >
                  <PencilSquareIcon className="h-5 w-5" />
                </button>
              )}
              {renderTooltip(
                tCell('tooltip_delete'),
                <button
                  type="button"
                  aria-label={tCell('tooltip_delete')}
                  className="text-danger cursor-pointer text-lg active:opacity-50"
                  onClick={handleDeleteInvoiceClick}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </>
          )}
        </div>
      );
    default:
      return cellValue;
  }
};

export default InvoiceTableCell;
