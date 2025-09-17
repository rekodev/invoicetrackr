'use client';

import {
  addToast,
  Checkbox,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Tooltip
} from '@heroui/react';
import { Key, useEffect, useState, useTransition } from 'react';

import { updateInvoiceStatusAction } from '@/lib/actions/invoice';
import { statusOptions } from '@/lib/constants/table';
import { Currency } from '@/lib/types/currency';
import { InvoiceModel, InvoiceStatus } from '@/lib/types/models/invoice';
import { getCurrencySymbol } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/format-date';

import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import DeleteIcon from '../icons/DeleteIcon';
import DocumentText from '../icons/DocumentText';
import EditIcon from '../icons/EditIcon';
import EyeIcon from '../icons/EyeIcon';

const statusColorMap: Record<InvoiceStatus, 'success' | 'danger' | 'warning'> =
  {
    paid: 'success',
    pending: 'warning',
    canceled: 'danger'
  };

type Props = {
  userId: number;
  currency: Currency;
  invoice: InvoiceModel;
  columnKey: Key;
  onView: (invoice: InvoiceModel) => void;
  onEdit: (invoice: InvoiceModel) => void;
  onDelete: (invoice: InvoiceModel) => void;
};

const InvoiceTableCell = ({
  userId,
  currency,
  invoice,
  columnKey,
  onView,
  onEdit,
  onDelete
}: Props) => {
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

      if ('errors' in response) setIsPaid((prev) => !prev);

      addToast({
        title: 'errors' in response ? 'Error' : 'Success',
        description: response.message,
        color: 'errors' in response ? 'danger' : 'success'
      });
    });
  };

  useEffect(() => {
    setIsPaid(invoice.status === 'paid');
  }, [invoice.status]);

  const handleMarkAsPaidClick = () => {
    setIsPaid(!isPaid);
    handleChangeStatus(isPaid ? 'pending' : 'paid');
  };

  const cellValue =
    invoice[
      columnKey as keyof Omit<
        InvoiceModel,
        | 'actions'
        | 'sender'
        | 'receiver'
        | 'services'
        | 'senderSignature'
        | 'bankingInformation'
      >
    ];

  switch (columnKey as keyof InvoiceModel | 'actions') {
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
          <DocumentText />
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
          {(invoice.totalAmount || 0).toFixed(2)}
        </p>
      );
    case 'date':
      return formatDate(cellValue as string) || '';
    case 'status':
      return (
        <Dropdown>
          <DropdownTrigger className="[&>button]:aria-expanded:rotate-180">
            <Chip
              as="button"
              isDisabled={isPending}
              className="cursor capitalize [&>svg]:aria-expanded:rotate-180"
              color={statusColorMap[invoice.status as InvoiceStatus]}
              size="sm"
              variant="flat"
              endContent={<ChevronDownIcon className="transition-transform" />}
            >
              {cellValue as string}
            </Chip>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Static Actions"
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
      );
    case 'actions':
      return (
        <div className="relative flex items-center gap-2">
          <Tooltip content={isPaid ? 'Mark as Pending' : 'Mark as Paid'}>
            <Checkbox
              size="sm"
              color="success"
              isSelected={isPaid}
              onChange={handleMarkAsPaidClick}
              isDisabled={isPending}
            />
          </Tooltip>
          <Tooltip content="Details">
            <span
              onClick={handleViewIconClick}
              className="text-default-400 cursor-pointer text-lg active:opacity-50"
            >
              <EyeIcon />
            </span>
          </Tooltip>
          <Tooltip content="Edit invoice">
            <span
              className="text-default-400 cursor-pointer text-lg active:opacity-50"
              onClick={handleEditInvoiceClick}
            >
              <EditIcon />
            </span>
          </Tooltip>
          <Tooltip color="danger" content="Delete invoice">
            <span
              className="text-danger cursor-pointer text-lg active:opacity-50"
              onClick={handleDeleteInvoiceClick}
            >
              <DeleteIcon />
            </span>
          </Tooltip>
        </div>
      );
    default:
      return cellValue;
  }
};

export default InvoiceTableCell;
