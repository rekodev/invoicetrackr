'use client';

import {
  ChevronDownIcon,
  ExclamationCircleIcon,
  EyeIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import {
  Button,
  Checkbox,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownPopover,
  DropdownTrigger,
  toast,
  Tooltip
} from '@heroui/react';
import type {
  InvoiceBody,
  InvoiceLifecycleStatus,
  InvoiceStatus
} from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';
import type { JSX, Key } from 'react';
import { useEffect, useState, useTransition } from 'react';

import { updateInvoiceStatusAction } from '@/lib/actions/invoice';
import { statusOptions } from '@/lib/constants/table';
import { Currency } from '@/lib/types/currency';
import { getCurrencySymbol } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/date';
import { getInvoiceDueStatus } from '@/lib/utils/invoice';

import InvoiceMoreActionsMenu from './invoice-more-actions-menu';
import IssueInvoiceModal from './issue-invoice-modal';

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
  onRequestDetails: (_invoice: InvoiceBody) => void;
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
  onDelete,
  onRequestDetails
}: Props) => {
  const tCell = useTranslations('invoices.cell.actions');
  const tForm = useTranslations('components.invoice_form');
  const tTable = useTranslations('invoices.table');
  const [isPaid, setIsPaid] = useState(invoice.status === 'paid');
  const [isPending, startTransition] = useTransition();

  const { isPastDue, daysPastDue } = getInvoiceDueStatus(invoice);
  const isDraft = (invoice.lifecycleStatus || 'draft') === 'draft';

  const handleViewIconClick = () => onView(invoice);
  const handleChangeStatus = (
    status: 'paid' | 'pending' | 'canceled' | undefined
  ) => {
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
      {children}
      <Tooltip.Content>{content}</Tooltip.Content>
    </Tooltip>
  );

  const handleMarkAsPaidClick = () => {
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
        <p className="text-bold text-sm">{invoice.invoiceId || '–'}</p>
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
          <span className="text-success">{getCurrencySymbol(currency)}</span>
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
        <div className="flex items-center justify-start gap-4">
          <div className="flex items-center gap-4">
            <Dropdown>
              <DropdownTrigger
                isDisabled={isPending || isDraft}
                className="h-auto min-w-0 cursor-pointer bg-transparent p-0 disabled:cursor-not-allowed disabled:opacity-50 [&[aria-expanded=true]_svg]:rotate-180"
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
                    <DropdownItem
                      key={item.uid}
                      id={item.uid}
                      textValue={item.name}
                    >
                      {item.name}
                      <Dropdown.ItemIndicator />
                    </DropdownItem>
                  )}
                </DropdownMenu>
              </DropdownPopover>
            </Dropdown>

            {renderTooltip(
              isDraft
                ? tCell('status_locked')
                : isPaid
                  ? tCell('mark_as_pending')
                  : tCell('mark_as_paid'),
              <Checkbox
                aria-label={
                  isPaid ? tCell('mark_as_pending') : tCell('mark_as_paid')
                }
                className="mr-0.5 max-w-5 p-0"
                isSelected={isPaid}
                onChange={handleMarkAsPaidClick}
                isDisabled={isPending || isDraft}
              />
            )}
          </div>

          {isPastDue && !isDraft && (
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
            tCell('tooltip_view'),
            <Button
              isIconOnly
              size="sm"
              variant="tertiary"
              type="button"
              aria-label={tCell('tooltip_view')}
              onPress={handleViewIconClick}
              className="text-muted"
            >
              <EyeIcon className="h-5 w-5" />
            </Button>
          )}
          {isDraft ? (
            <IssueInvoiceModal userId={userId} invoiceData={invoice} />
          ) : null}
          {renderTooltip(
            tCell('tooltip_send_email'),
            <Button
              isIconOnly
              size="sm"
              variant="tertiary"
              type="button"
              aria-label={tCell('tooltip_send_email')}
              onPress={() => onSendEmail(invoice)}
              className="text-accent"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
            </Button>
          )}
          <InvoiceMoreActionsMenu
            invoice={invoice}
            onRequestDetails={onRequestDetails}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      );
    default:
      return typeof cellValue === 'string' || typeof cellValue === 'number'
        ? cellValue
        : null;
  }
};

export default InvoiceTableCell;
