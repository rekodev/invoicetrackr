import { Chip, Tooltip } from '@nextui-org/react';
import { Key } from 'react';

import { InvoiceModel, InvoiceStatus } from '@/types/models/invoice';

import DocumentText from './icons/DocumentText';
import DeleteIcon from '../components/icons/DeleteIcon';
import EditIcon from '../components/icons/EditIcon';
import EyeIcon from '../components/icons/EyeIcon';

const statusColorMap: Record<InvoiceStatus, 'success' | 'danger' | 'warning'> =
  {
    paid: 'success',
    pending: 'warning',
    canceled: 'danger',
  };

type Props = {
  invoice: InvoiceModel;
  columnKey: Key;
  onViewClick: (invoice: InvoiceModel) => void;
};

const InvoiceTableCell = ({ invoice, columnKey, onViewClick }: Props) => {
  const handleViewIconClick = () => {
    onViewClick(invoice);
  };

  const cellValue =
    invoice[
      columnKey as keyof Omit<
        InvoiceModel,
        'actions' | 'sender' | 'receiver' | 'services'
      >
    ];

  switch (columnKey as keyof InvoiceModel | 'actions') {
    case 'sender':
      return;
    case 'receiver':
      return;
    case 'services':
      return;
    case 'id':
      return (
        <div className='flex'>
          <DocumentText />
          &nbsp;
          <p className='text-bold text-small capitalize'>
            {cellValue as string}
          </p>
        </div>
      );
    case 'company':
      return (
        <div className='flex flex-col'>
          <p className='text-bold text-small capitalize'>
            {cellValue as string}
          </p>
        </div>
      );
    case 'status':
      return (
        <Chip
          className='capitalize'
          color={statusColorMap[invoice.status]}
          size='sm'
          variant='flat'
        >
          {cellValue as string}
        </Chip>
      );
    case 'actions':
      return (
        <div className='relative flex items-center gap-2'>
          <Tooltip disableAnimation content='Details'>
            <span
              onClick={handleViewIconClick}
              className='text-lg text-default-400 cursor-pointer active:opacity-50'
            >
              <EyeIcon />
            </span>
          </Tooltip>
          <Tooltip disableAnimation content='Edit user'>
            <span className='text-lg text-default-400 cursor-pointer active:opacity-50'>
              <EditIcon />
            </span>
          </Tooltip>
          <Tooltip disableAnimation color='danger' content='Delete user'>
            <span className='text-lg text-danger cursor-pointer active:opacity-50'>
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
