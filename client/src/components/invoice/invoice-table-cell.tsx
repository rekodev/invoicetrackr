import { Chip, Tooltip } from '@heroui/react';
import { Key } from 'react';

import { Currency } from '@/lib/types/currency';
import { InvoiceModel, InvoiceStatus } from '@/lib/types/models/invoice';
import { getCurrencySymbol } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/format-date';

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
  currency: Currency;
  invoice: InvoiceModel;
  columnKey: Key;
  onView: (invoice: InvoiceModel) => void;
  onEdit: (invoice: InvoiceModel) => void;
  onDelete: (invoice: InvoiceModel) => void;
};

const InvoiceTableCell = ({
  currency,
  invoice,
  columnKey,
  onView,
  onEdit,
  onDelete
}: Props) => {
  const handleViewIconClick = () => onView(invoice);
  const handleEditInvoiceClick = () => onEdit(invoice);
  const handleDeleteInvoiceClick = () => onDelete(invoice);

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
        <Chip
          className="capitalize"
          color={statusColorMap[invoice.status as InvoiceStatus]}
          size="sm"
          variant="flat"
        >
          {cellValue as string}
        </Chip>
      );
    case 'actions':
      return (
        <div className="relative flex items-center gap-2">
          <Tooltip disableAnimation content="Details">
            <span
              onClick={handleViewIconClick}
              className="cursor-pointer text-lg text-default-400 active:opacity-50"
            >
              <EyeIcon />
            </span>
          </Tooltip>
          <Tooltip disableAnimation content="Edit invoice">
            <span
              className="cursor-pointer text-lg text-default-400 active:opacity-50"
              onClick={handleEditInvoiceClick}
            >
              <EditIcon />
            </span>
          </Tooltip>
          <Tooltip disableAnimation color="danger" content="Delete invoice">
            <span
              className="cursor-pointer text-lg text-danger active:opacity-50"
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
