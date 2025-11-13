'use client';

import {
  ArrowDownTrayIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { BlobProvider, PDFDownloadLink } from '@react-pdf/renderer';
import {
  Checkbox,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Tooltip,
  addToast
} from '@heroui/react';
import { Key, useEffect, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { Invoice, InvoiceStatus } from '@invoicetrackr/types';
import { Currency } from '@/lib/types/currency';
import { formatDate } from '@/lib/utils/format-date';
import { getCurrencySymbol } from '@/lib/utils/currency';
import { statusOptions } from '@/lib/constants/table';
import { updateInvoiceStatusAction } from '@/lib/actions/invoice';

import PDFDocument from '../pdf/pdf-document';
import SendInvoiceEmailTableAction from './send-invoice-email-table-action';

const statusColorMap: Record<InvoiceStatus, 'success' | 'danger' | 'warning'> =
  {
    paid: 'success',
    pending: 'warning',
    canceled: 'danger'
  };

type Props = {
  userId: number;
  currency: Currency;
  language: string;
  invoice: Invoice;
  columnKey: Key;
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
};

const InvoiceTableCell = ({
  userId,
  currency,
  language,
  invoice,
  columnKey,
  onView,
  onEdit,
  onDelete
}: Props) => {
  const tPdf = useTranslations('invoices.pdf');
  const tCell = useTranslations('invoices.cell.actions');
  const tForm = useTranslations('components.invoice_form');
  const [isPaid, setIsPaid] = useState(invoice.status === 'paid');
  const [isPending, startTransition] = useTransition();

  const handleViewIconClick = () => onView(invoice);
  const handleEditInvoiceClick = () => onEdit(invoice);
  const handleDeleteInvoiceClick = () => onDelete(invoice);
  const handleChangeStatus = (
    status: 'paid' | 'pending' | 'canceled' | undefined
  ) => {
    if (!status || status === invoice.status) return;

    startTransition(async () => {
      const response = await updateInvoiceStatusAction({
        userId,
        invoiceId: invoice.id,
        newStatus: status
      });

      if (!response.ok) setIsPaid((prev) => !prev);

      addToast({
        title: response.message,
        color: response.ok ? 'success' : 'danger'
      });
    });
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsPaid(invoice.status === 'paid');
  }, [invoice.status]);

  const handleMarkAsPaidClick = () => {
    setIsPaid(!isPaid);
    handleChangeStatus(isPaid ? 'pending' : 'paid');
  };

  const renderPdfDocument = () => (
    <PDFDocument
      t={tPdf}
      language={language}
      senderSignatureImage={invoice.senderSignature as string}
      bankAccount={invoice.bankingInformation}
      currency={currency}
      invoiceData={invoice}
    />
  );

  const cellValue =
    invoice[
      columnKey as keyof Omit<
        Invoice,
        | 'actions'
        | 'sender'
        | 'receiver'
        | 'services'
        | 'senderSignature'
        | 'bankingInformation'
      >
    ];

  switch (columnKey as keyof Invoice | 'actions') {
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
          <p className="text-bold text-small capitalize">{invoice.invoiceId}</p>
        </div>
      );
    case 'receiver':
      return (
        <div className="flex flex-col">
          <p className="text-bold text-small capitalize">
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
    case 'status':
      return (
        <div className="flex items-center gap-4">
          <Dropdown>
            <DropdownTrigger className="[&>button]:aria-expanded:rotate-180">
              <Chip
                as="button"
                isDisabled={isPending}
                className="cursor capitalize [&>svg]:aria-expanded:rotate-180"
                color={statusColorMap[invoice.status as InvoiceStatus]}
                size="sm"
                variant="flat"
                endContent={
                  <ChevronDownIcon className="transition-transform" />
                }
              >
                {cellValue as string}
              </Chip>
            </DropdownTrigger>
            <DropdownMenu
              aria-label={tForm('a11y.static_actions_label')}
              selectionMode="single"
              selectedKeys={[cellValue]}
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
              {statusOptions.map((status) => (
                <DropdownItem key={status.uid}>{status.name}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          <Tooltip
            content={isPaid ? tCell('mark_as_pending') : tCell('mark_as_paid')}
          >
            <Checkbox
              className="mr-0.5 max-w-5 p-0"
              size="sm"
              color="success"
              isSelected={isPaid}
              onChange={handleMarkAsPaidClick}
              isDisabled={isPending}
            />
          </Tooltip>
        </div>
      );
    case 'actions':
      return (
        <div className="relative flex items-center justify-end gap-2">
          <BlobProvider document={renderPdfDocument()}>
            {({ blob }) => {
              return (
                <SendInvoiceEmailTableAction
                  blob={blob}
                  userId={userId}
                  invoice={invoice}
                  currency={currency}
                />
              );
            }}
          </BlobProvider>
          <Tooltip content={tCell('tooltip_download')}>
            <PDFDownloadLink
              fileName={invoice.invoiceId}
              className="text-default-400 h-5 w-5"
              document={renderPdfDocument()}
            >
              <ArrowDownTrayIcon />
            </PDFDownloadLink>
          </Tooltip>
          <Tooltip content={tCell('tooltip_view')}>
            <span
              onClick={handleViewIconClick}
              className="text-default-400 cursor-pointer text-lg active:opacity-50"
            >
              <EyeIcon className="h-5 w-5" />
            </span>
          </Tooltip>
          <Tooltip content={tCell('tooltip_edit')}>
            <span
              className="text-default-400 cursor-pointer text-lg active:opacity-50"
              onClick={handleEditInvoiceClick}
            >
              <PencilSquareIcon className="h-5 w-5" />
            </span>
          </Tooltip>
          <Tooltip color="danger" content={tCell('tooltip_delete')}>
            <span
              className="text-danger cursor-pointer text-lg active:opacity-50"
              onClick={handleDeleteInvoiceClick}
            >
              <TrashIcon className="h-5 w-5" />
            </span>
          </Tooltip>
        </div>
      );
    default:
      return cellValue;
  }
};

export default InvoiceTableCell;
